const { PostResponse } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const newResponse = await PostResponse.create(req.body);
    res.status(201).json(newResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear respuesta' });
  }
};
