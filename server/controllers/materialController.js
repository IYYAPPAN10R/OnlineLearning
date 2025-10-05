const Material = require('../models/Material');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../utils/fileUpload');

// Upload a new material
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, type, courseId } = req.body;
    // Get user from database using Firebase UID to obtain ObjectId
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ uid: firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'Uploader user not found' });
    }

    // Get file info
    const filePath = path.relative(path.join(__dirname, '..'), req.file.path);
    
    // Determine file type from mimetype or provided type
    let fileType = type;
    if (!fileType) {
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('video/')) {
        fileType = 'video';
      } else if (mimeType === 'application/pdf') {
        fileType = 'pdf';
      } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        fileType = 'presentation';
      } else if (mimeType.includes('document') || mimeType.includes('word')) {
        fileType = 'document';
      } else if (mimeType.startsWith('audio/')) {
        fileType = 'audio';
      } else if (mimeType.startsWith('image/')) {
        fileType = 'image';
      } else {
        fileType = 'other';
      }
    }
    
    const fileSize = req.file.size;

    // Create new material
    const material = new Material({
      title,
      description,
      filePath,
      type: fileType, // Use fileType for the main type field
      fileType, // Keep fileType for compatibility
      fileSize,
      uploadedBy: user._id,
      createdBy: user._id, // Legacy compatibility
      courseId: courseId || 'general',
      content: description || title // Set content to avoid validation error
    });

    await material.save();

    // Populate uploadedBy field with user info
    await material.populate('uploadedBy', 'displayName email');

    res.status(201).json({
      message: 'File uploaded successfully',
      material
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
};

// Get all materials
exports.getAllMaterials = async (req, res) => {
  try {
    const { courseId, type, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (courseId) query.courseId = courseId;
    if (type) query.fileType = type;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const materials = await Material.find(query)
      .sort(sort)
      .populate('uploadedBy', 'name email')
      .select('-__v');
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

// Get a single material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .select('-__v');
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Increment view count
    material.views += 1;
    await material.save();
    
    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

// Download a material
exports.downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const filePath = path.join(__dirname, '..', material.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Increment download count
    material.downloads += 1;
    await material.save();
    
    // Get filename for download
    const filename = `${material.title}${path.extname(filePath)}`;
    
    // Send file for download
    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// Delete a material (admin only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Delete the file
    const filePath = path.join(__dirname, '..', material.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await Material.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
};
