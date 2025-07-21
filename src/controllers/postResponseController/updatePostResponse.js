const { PostResponse } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const response = await PostResponse.findByPk(req.params.id);
    if (!response) return res.status(404).json({ error: 'Respuesta no encontrada' });
    await response.update(req.body);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar respuesta' });
  }
};
