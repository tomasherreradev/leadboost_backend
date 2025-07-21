'use strict';
const { SocialAccount } = require('../../../models');

module.exports = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const socialAccounts = await SocialAccount.findAll({
      where: { user_id: userId },
    });

    const status = {
      facebook: false,
      instagram: false,
      gmail: false,
      whatsapp: false,
      accounts: {
        facebook: null,
        instagram: null,
        gmail: null,
        whatsapp: null,
      },
    };

    socialAccounts.forEach((account) => {
      console.log(account.provider);
      status[account.provider] = true;
      status.accounts[account.provider] = {
        id: account.id,
        provider_user_id: account.provider_user_id,
        expires_at: account.expires_at,
        extra_data: account.extra_data ? JSON.parse(account.extra_data) : null,
      };
    });

    return res.json(status);
  } catch (error) {
    console.error('Error al obtener estado de conexión:', error);
    return res.status(500).json({ error: 'Error al obtener estado de conexión' });
  }
};