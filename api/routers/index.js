import express from 'express'
import publicRouter from './public.js';
import privateRouter from './private.js';
const apiRouter = express.Router()

apiRouter.use("/public", publicRouter);
apiRouter.use("/private", privateRouter);

export default apiRouter;