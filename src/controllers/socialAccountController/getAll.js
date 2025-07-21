const { SocialAccount } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const accounts = await SocialAccount.findAll();
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cuentas sociales' });
  }
};
