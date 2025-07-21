const { SocialAccount } = require('../../../models');
module.exports = async (req, res) => {
  try {
    const newAccount = await SocialAccount.create(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cuenta social' });
  }
};
