import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';

const router = Router();
const controller = new SearchController();

router.get('/search', controller.search);
router.get('/fetch', controller.fetch);

export default router;