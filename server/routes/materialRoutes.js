const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { uploadSingle } = require('../utils/fileUpload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const instructorOrAdmin = require('../middleware/instructorOrAdmin');

// Upload material (instructor or admin only)
router.post(
  '/',
  auth,
  instructorOrAdmin,
  uploadSingle('file'),
  materialController.uploadMaterial
);

// Get all materials (public)
router.get('/', materialController.getAllMaterials);

// Get single material (public)
router.get('/:id', materialController.getMaterialById);

// Download material (public)
router.get('/:id/download', materialController.downloadMaterial);

// Delete material (admin only)
router.delete('/:id', auth, admin, materialController.deleteMaterial);

module.exports = router;
