const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createSubmission,
  getSubmissions,
  getSubmission,
  generateSubmissionProfile,
  updateSubmissionStatus,
  deleteSubmission,
  updateSubmissionImage
} = require('../controllers/submissionController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// File upload fields
const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'clientSignature', maxCount: 1 },
  { name: 'representativeSignature', maxCount: 1 }
]);

// Routes
router.post('/', uploadFields, createSubmission);
router.get('/', getSubmissions);
router.get('/:id', getSubmission);
router.post('/:id/generate-profile', generateSubmissionProfile);
router.post('/:id/image', upload.single('image'), updateSubmissionImage);
router.put('/:id/status', updateSubmissionStatus);
router.delete('/:id', deleteSubmission);

module.exports = router;
