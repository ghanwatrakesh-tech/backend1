const Log = require('../models/Log');

const createLog = async (req, action, details = "") => {
  try {
    await Log.create({
      userId: req.user?._id,
      action,
      details,
      route: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date()
    });
  } catch (err) {
    console.log("Log error:", err.message);
  }
};

module.exports = createLog;