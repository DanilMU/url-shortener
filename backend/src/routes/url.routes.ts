import { Router } from 'express';
import { urlController } from '../controllers/url.controller';

export const router = Router();

router.post('/api/shorten', urlController.shorten);
router.get('/api/stats/:shortCode', urlController.getStats);
router.get('/api/urls', urlController.getRecent);
router.get('/:shortCode', urlController.redirect);
