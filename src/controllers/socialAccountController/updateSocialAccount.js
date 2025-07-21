const { SocialAccount } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const account = await SocialAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Cuenta no encontrada' });
    await account.update(req.body);
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cuenta social' });
  }
};
