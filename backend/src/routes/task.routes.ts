import { Router } from 'express';
import { body } from 'express-validator';
import { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats } from '../controllers/task.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTask);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  validate,
  createTask
);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601(),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

export default router;
