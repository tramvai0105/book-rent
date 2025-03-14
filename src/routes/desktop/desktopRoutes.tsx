import { error } from "console"
import NotFound from "./NotFound"
import AuthPage from "./pages/auth/AuthPage"
import BookPage from "./pages/book/BookPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import Listings from "./pages/dashboard/pages/Listings"
import MainPage from "./pages/main/MainPage"
import Root from "./Root"
import Orders from "./pages/dashboard/pages/Orders"
import Balance from "./pages/dashboard/pages/Balance"
import HistoryPage from "./pages/dashboard/pages/HistoryPage"
import Options from "./pages/dashboard/pages/Options"
import NewListing from "./pages/dashboard/pages/NewListing"

const desktopRoutes = [
    {
      path: "/",
      element: <Root />,
      errorElement: <NotFound/>,
      children: [
        {
          path: "/",
          element: <MainPage/>,
        },
        {
          path: "/dashboard",
          element: <DashboardPage/>,
          children: [
            {
              path: "/dashboard",
              element: <Listings/>,
            },
            {
              path: "/dashboard/listings",
              element: <Listings/>,
            },
            {
              path: "/dashboard/listings/new",
              element: <NewListing/>,
            },
            {
              path: "/dashboard/orders",
              element: <Orders/>,
            },
            {
              path: "/dashboard/balance",
              element: <Balance/>,
            },
            {
              path: "/dashboard/history",
              element: <HistoryPage/>,
            },
            {
              path: "/dashboard/options",
              element: <Options/>,
            },
            {
              path: "/dashboard/:id",
              element: <Listings/>,
            },
          ]
        },
        {
          path: "/book/:id",
          element: <BookPage/>,
        },
        {
          path: "/auth",
          element: <AuthPage/>,
        },
      ]
    },
]

export default desktopRoutes 