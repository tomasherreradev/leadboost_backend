const { PostResponse } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const responses = await PostResponse.findAll();
    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
};
