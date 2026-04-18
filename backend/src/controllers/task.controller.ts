import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, unknown> = {
      $or: [{ createdBy: req.user?.id }, { assignedTo: req.user?.id }],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      tasks,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const userId = req.user?.id;
    const isOwner = task.createdBy._id.toString() === userId;
    const isAssigned = task.assignedTo?._id?.toString() === userId;

    if (!isOwner && !isAssigned && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to view this task' });
      return;
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user?.id,
      assignedTo: assignedTo || undefined,
      tags: tags || [],
    });

    const populated = await task.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
    ]);

    res.status(201).json({ success: true, message: 'Task created successfully', task: populated });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const userId = req.user?.id;
    const isOwner = task.createdBy.toString() === userId;

    if (!isOwner && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      return;
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'tags'];
    const updates: Record<string, unknown> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({ success: true, message: 'Task updated successfully', task: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const isOwner = task.createdBy.toString() === req.user?.id;

    if (!isOwner && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
      return;
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);

    const stats = await Task.aggregate([
      { $match: { $or: [{ createdBy: userId }, { assignedTo: userId }] } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const formatted = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    stats.forEach((s) => {
      formatted[s._id as keyof typeof formatted] = s.count;
      formatted.total += s.count;
    });

    res.json({ success: true, stats: formatted });
  } catch (error) {
    next(error);
  }
};
