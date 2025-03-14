import './index.css'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import desktopRoutes from './routes/desktop/desktopRoutes'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const userAgent = navigator.userAgent;

let deviceType;

if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile';
} else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Mobile';
} else {
    deviceType = 'Desktop';
}

const router = createBrowserRouter(deviceType == "Desktop" ? desktopRoutes : desktopRoutes)

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
