import { Router } from 'express';
import { getUsers, updateProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getUsers);
router.put('/profile', updateProfile);

export default router;
