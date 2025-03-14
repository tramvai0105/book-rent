import fs from 'node:fs/promises'
import express from 'express'
import authRouter from './api/routers/auth.js'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import session from 'express-session';
import passport from './api/utils/passport/index.js';
import businessRouter from './api/routers/business.js';
import apiRouter from './api/routers/index.js';

import MySQLStore from 'express-mysql-session';
import mysql from 'mysql2/promise';

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Create http server
export const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const dbSessionOptions = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'sessions'
};

// Создание пула соединений
const connection = mysql.createPool(dbSessionOptions);

// Настройка хранилища сессий
const sessionStore = new (MySQLStore(session))({} , connection);

app.use(
  session({
    secret: process.env.VITE_AUTH_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000 
    }, // В production`secure: true`,
  })
);
app.use(passport.initialize())
app.use(passport.session())

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.use("/auth", authRouter);
app.use("/api/b/", businessRouter);
app.use("/api/", apiRouter);

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')
    const userAgent = req.headers['user-agent'];
    const deviceType = userAgent.isMobile ? 'Mobile' : userAgent.isTablet ? 'Mobile' : 'Desktop';
    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url, req, res, deviceType)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
