const { Post } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
};
