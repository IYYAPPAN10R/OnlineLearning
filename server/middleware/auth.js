const admin = require('../config/firebase-admin');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'student'
    };

    // Update last active and record login if needed (fire-and-forget)
    try {
      const update = { lastActiveAt: new Date(), isActive: true };
      const user = await User.findOneAndUpdate({ uid: decodedToken.uid }, { $set: update }, { new: true });
      if (user && user.loginHistory && user.loginHistory.length === 0) {
        // First time after startup; ensure at least one entry
        user.loginHistory.push({ ip: req.ip, userAgent: req.headers['user-agent'] });
        await user.save();
      }
    } catch (e) {
      // Don't block request on telemetry failure
      console.error('Activity tracking error:', e.message);
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
