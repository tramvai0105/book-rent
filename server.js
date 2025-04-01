import fs from 'node:fs/promises'
import express from 'express'
import authRouter from './api/routers/auth.js'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import db from "./api/db.js";

import session from 'express-session';
import passport from './api/utils/passport/index.js';
import businessRouter from './api/routers/business.js';
import apiRouter from './api/routers/index.js';

import MySQLStore from 'express-mysql-session';
import mysql from 'mysql2/promise';

import http from 'http';
import { Server } from "socket.io";
import { fetchUserChats, onlyForHandshake } from './utils.js';
import { config } from 'dotenv';
config(); // Для env

// Для работы с файловой системой
import { fileURLToPath } from 'url';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Парсеры для передачи данных в запросах
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/files', express.static(path.join(__dirname, 'files'))); // Для раздачи статики

// Опции базы данных сессий.
const dbSessionOptions = {
  host: process.env.VITE_DB_HOST,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: 'sessions'
}; // База данных сессии

// Создание пула соединений
const connection = mysql.createPool(dbSessionOptions);

// Настройка хранилища сессий
const sessionStore = new (MySQLStore(session))({}, connection);

// Подключение к базе данных сессий.
const sessionMiddleware = session({
  secret: process.env.VITE_AUTH_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }, // В production`secure: true`,
})

// Для обработки сессий паспортом
app.use(sessionMiddleware);
app.use(passport.initialize())
app.use(passport.session())

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
console.log("Working in production", isProduction);
if (!isProduction) {
  /// Если не production используем dev сервер vite
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  /// Если production используем статику из dist сгенерированую при npm run build
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Наши роуты(авторизация, бизнесс логика, прочие апи)
app.use("/auth", authRouter);
app.use("/api/b/", businessRouter);
app.use("/api/", apiRouter);

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    // Получаем информацию о пользователе
    const url = req.originalUrl.replace(base, '')
    const userAgent = req.headers['user-agent'];
    let deviceType = 'Desktop';
    if (userAgent && /mobile/i.test(userAgent)) {
      deviceType = 'Mobile';
    } else if (userAgent && /tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    }
    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    
    if (!isProduction) {
      // Always read fresh template in development
      /// Если не production рендерим с сервера
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      /// Если production используем прочитаные из файла данные build
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    /// Рендерим html приложения
    const rendered = await render(url, req, res, deviceType)

    /// Заменяем заголовок и тело документа на отрендеренные данные
    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    /// Отдаем страницу
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

/// Создаем сервер
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
}); // Сервер сокета

server.listen(port, () => {
  console.log(`Server started at http://localhost:${port} 123`)
})

/// Работа сокета чата
io.on('connection', async (socket) => {
  /// Получаем данные пользователя через Middleware
  const user = socket.request.user;
  /// Подключаем пользователя к чатам согласно db
  let chats = await fetchUserChats(user.id);
  chats.forEach(chat => {
    socket.join(chat.id);
  });
  
  /// Отдаем инит данные
  socket.on('requestInitData', async () => {
    const userId = socket.request.user.id;
    const chats = await fetchUserChats(userId);
    chats.forEach(chat => {
      socket.join(chat.id);
    });
    socket.emit('init', chats);
  });

  /// Если пришло сообщение сохраняем
  socket.on('sendMessage', async ({ chatId, message }) => {
    try {
      const [chat] = await db.query(`SELECT listingId, sellerId, buyerId FROM Chats WHERE id = ?`, [chatId]);

      if (chat.length === 0) {
        return socket.emit('error', 'Чат не найден');
      }

      const listingId = chat[0].listingId;
      const receiverId = chat[0].sellerId === user.id ? chat[0].buyerId : chat[0].sellerId;

      const result = await db.query(`
        INSERT INTO сhatmessages (senderId, receiverId, chatId, message)
        VALUES (?, ?, ?, ?)`,
        [user.id, receiverId, chatId, message]
      );

      /// И отдаем всем пользователя из чата
      io.to(chatId).emit('newMessage', {
        id: result.insertId,
        senderId: user.id,
        receiverId: receiverId,
        chatId: chatId,
        message: message,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Ошибка при сохранении сообщения:', error);
      socket.emit('error', 'Не удалось отправить сообщение');
    }
  });
});

/// Получаем в запросе данные пользователя
io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
  onlyForHandshake((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  }),
);