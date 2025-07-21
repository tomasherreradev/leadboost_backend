const { PostTarget } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const target = await PostTarget.findByPk(req.params.id);
    if (!target) return res.status(404).json({ error: 'Objetivo no encontrado' });
    await target.update(req.body);
    res.json(target);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar objetivo de publicación' });
  }
};
