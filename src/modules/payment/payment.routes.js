import { Router } from 'express';
import { createOrder } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.post('/create-order', createOrder);
router.get('/test', (req, res) => res.json({ msg: 'payment route works' }));
export default router;