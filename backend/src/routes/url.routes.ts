import { Router } from 'express';
import { urlController } from '../controllers/url.controller';

export const router = Router();

// 1. Специфичные API маршруты регистрируются первыми
router.post('/api/shorten', urlController.shorten);
router.get('/api/stats/:shortCode', urlController.getStats);
router.get('/api/urls', urlController.getRecent);

// 2. Catch-all маршрут редиректа по короткому коду.
// ВАЖНО: /:shortCode является wildcard маршрутом верхнего уровня для одного сегмента.
// Он ОБЯЗАН оставаться последним в роутере, иначе любые новые маршруты с одним
// сегментом пути (например, /health, /metrics) будут ошибочно перехвачены данным обработчиком.
router.get('/:shortCode', urlController.redirect);
