import express from 'express';
import multer from 'multer';
import {
  createDesign,
  listDesigns,
  searchByDesignNumber,
  getDesignById,
  updateDesign,
  deleteDesign,
  checkDuplicate,
  searchByImage,
  getDashboardStats
} from '../controllers/designController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed.'));
    }
    cb(null, true);
  }
});

router.use(requireAuth);
router.get('/dashboard/stats', getDashboardStats);
router.get('/', listDesigns);
router.get('/search', searchByDesignNumber);
router.get('/:id', getDesignById);
router.post('/check-duplicate', requireRole('admin', 'staff'), upload.single('image'), checkDuplicate);
router.post('/search-by-image', upload.single('image'), searchByImage);
router.post('/', requireRole('admin', 'staff'), upload.single('image'), createDesign);
router.put('/:id', requireRole('admin', 'staff'), upload.single('image'), updateDesign);
router.delete('/:id', requireRole('admin'), deleteDesign);

export default router;
