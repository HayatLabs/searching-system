import { Router } from 'express';
import searchRoutes from './search.routes.js';

const rootRouter = Router();

rootRouter.use(searchRoutes);

export default rootRouter;