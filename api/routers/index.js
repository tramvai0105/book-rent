import express from 'express'
import publicRouter from './public.js';
import privateRouter from './private.js';
import moderatorRouter from './moderator.js';
const apiRouter = express.Router()

apiRouter.use("/public", publicRouter);
apiRouter.use("/private", privateRouter);
apiRouter.use("/m/", moderatorRouter);

export default apiRouter;