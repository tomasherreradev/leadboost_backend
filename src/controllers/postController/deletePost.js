const { Post } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });
    await post.destroy();
    res.json({ message: 'Publicación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar publicación' });
  }
};
