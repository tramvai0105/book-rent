import express from 'express'
const apiRouter = express.Router()

import booksRouter from "./books.js"
apiRouter.use("/books", booksRouter)

export default apiRouter;