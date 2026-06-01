const Log = require('../models/Log');

exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, level = "", userId = "" } = req.query;

    // Build query with filters
    const query = {};
    if (level) query.level = level;
    if (userId) query.userId = userId;

    const logs = await Log.find(query)
      .populate('userId', 'username role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Log.countDocuments(query);

    if (!logs || logs.length === 0) {
      return res.json({
        success: true,
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        logs: [],
        message: "No logs found"
      });
    }

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      logs,
      message: `Retrieved ${logs.length} logs`
    });

  } catch (err) {
    next(err);
  }
};