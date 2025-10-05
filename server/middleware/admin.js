const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Find the user in the database to verify admin status
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // If we get here, the user is an admin
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
