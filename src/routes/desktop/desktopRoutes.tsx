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
import DashboardMod from "./pages/dashboard/DashboardMod"
import DashboardUser from "./pages/dashboard/DashboardUser"
import ReviewsPage from "./pages/dashboard/moderator/ReviewsPage"
import DisputesPage from "./pages/dashboard/moderator/DisputesPage"

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
              path: "/dashboard/mod",
              element: <DashboardMod/>,
              children: [
                {
                  path: "/dashboard/mod/reviews",
                  element: <ReviewsPage/>,
                },
                {
                  path: "/dashboard/mod/disputes",
                  element: <DisputesPage/>,
                },
              ],
            },
            {
              path: "/dashboard",
              element: <DashboardUser/>,
              children: [
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
              ],
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