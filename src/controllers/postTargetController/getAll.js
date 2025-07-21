const { PostTarget } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const targets = await PostTarget.findAll();
    res.json(targets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener objetivos de publicación' });
  }
};
