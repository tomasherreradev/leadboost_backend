const { google } = require('googleapis');
const { SocialAccount } = require('../../../models');
const dotenv = require('dotenv');
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5000/api/social/gmail/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes necesarios para enviar correo y obtener info del perfil
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

module.exports = {
  getAuthUrl: async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const state = JSON.stringify({ userId });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state
    });

    res.json({ authUrl });
  },

  handleCallback: async (req, res) => {
    try {
      const { code, state } = req.query;
      const { userId } = JSON.parse(state);

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });

      const { data: userInfo } = await oauth2.userinfo.get();

      await SocialAccount.upsert({
        user_id: userId,
        provider: 'gmail',
        provider_user_id: userInfo.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date,
      });

      res.redirect(`${process.env.FRONTEND_URL}/settings/networks`); // Cambia por tu ruta en frontend
    } catch (error) {
      console.error('Error en el callback de Gmail:', error);
      res.status(500).json({ error: 'Error al conectar cuenta de Gmail' });
    }
  },

  getStatus: async (req, res) => {
    try {
      const userId = req.user?.id;
      const gmailAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'gmail' }
      });

      res.json({
        connected: !!gmailAccount,
        account: gmailAccount
      });
    } catch (error) {
      console.error('Error al obtener estado de Gmail:', error);
      res.status(500).json({ error: 'Error al obtener estado de Gmail' });
    }
  },

  disconnect: async (req, res) => {
    try {
      const userId = req.user?.id;
      await SocialAccount.destroy({
        where: { user_id: userId, provider: 'gmail' }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error al desconectar Gmail:', error);
      res.status(500).json({ error: 'Error al desconectar Gmail' });
    }
  }
};
