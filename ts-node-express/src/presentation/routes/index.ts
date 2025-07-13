import { Router } from 'express';
import hypertacRoutes from './hypertac.routes';

const router = Router();

// เมาท์เส้นทางที่เกี่ยวข้องกับ Hypertac ภายใต้พาธ '/hypertac'
router.use('/hypertac', hypertacRoutes);

export default router;
