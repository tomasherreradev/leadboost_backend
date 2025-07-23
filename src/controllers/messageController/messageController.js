const { Message } = require('../../../models');

// GET /api/messages?provider=facebook|instagram
exports.getMessagesByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json([]);
    }
    const userId = req.user.id;
    const provider = req.query.provider;
    const where = { user_id: userId };
    if (provider) where.provider = provider;
    const messages = await Message.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });
    res.json(Array.isArray(messages) ? messages : []);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(200).json([]);
  }
};
