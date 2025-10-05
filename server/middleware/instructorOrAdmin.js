const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin' || user.role === 'instructor') {
      return next();
    }

    return res.status(403).json({ error: 'Instructor or Admin access required' });
  } catch (error) {
    console.error('InstructorOrAdmin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


