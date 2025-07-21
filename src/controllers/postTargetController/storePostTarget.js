const { PostTarget } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const newTarget = await PostTarget.create(req.body);
    res.status(201).json(newTarget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear objetivo de publicación' });
  }
};
