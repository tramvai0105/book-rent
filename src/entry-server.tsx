import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import desktopRoutes from './routes/desktop/desktopRoutes';
import './index.css'

function createFetchRequest(req: Request, res: Response) {
  let origin = `${req.protocol}://${req.get("host")}`;
  // Note: This had to take originalUrl into account for presumably vite's proxying
  let url = new URL(req.originalUrl || req.url, origin);

  let controller = new AbortController();
  res.on("close", () => controller.abort());

  let headers = new Headers();

  for (let [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  let init = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  return new Request(url.href, init);
};

export async function render(_url: string, req: Request, res: Response, device: "Desktop" | "Mobile") {

  let handler = createStaticHandler(device == "Desktop" ? desktopRoutes : desktopRoutes);
  let fetchRequest = createFetchRequest(req, res);
  let context = await handler.query(fetchRequest);

  // If we got a redirect response, short circuit and let our Express server
  // handle that directly
  let router = createStaticRouter(
    handler.dataRoutes,
    context
  );
  
  const html = renderToString(
    <StrictMode>
      <StaticRouterProvider
        router={router}
        context={context}
      />
    </StrictMode>,
  );

  return { html };
}