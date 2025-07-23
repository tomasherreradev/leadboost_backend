const { Message } = require('../models');

// GET /api/messages?provider=facebook|instagram
exports.getMessagesByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = req.query.provider;
    const where = { user_id: userId };
    if (provider) where.provider = provider;
    const messages = await Message.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};
