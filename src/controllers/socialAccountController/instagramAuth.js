const { SocialAccount } = require('../../../models');
const axios = require('axios');
const socialConfig = require('../../../config/socialConfig');
const dotenv = require('dotenv');
dotenv.config();

const INSTAGRAM_APP_ID = socialConfig.instagram.appId;
const INSTAGRAM_APP_SECRET = socialConfig.instagram.appSecret;

module.exports = {
  // Generar URL de autorización de Instagram
  getAuthUrl: (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/social/instagram/callback`;

    const scopes = [
        'pages_show_list',
        'instagram_basic',
        'instagram_manage_insights',
        'pages_read_engagement',
        'pages_manage_metadata'
    ];

    const state = encodeURIComponent(JSON.stringify({ userId: req.user.id }));
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join(',')}&response_type=code&state=${state}`;

    res.json({ authUrl });
  },

  // Manejar el callback de Instagram
  handleCallback: async (req, res) => {
    try {
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Código de autorización no proporcionado' });
      }

      const parsedState = JSON.parse(state);
      const userId = parsedState?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/social/instagram/callback`;

      // Intercambiar código por token de acceso
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          redirect_uri: redirectUri,
          code: code
        }
      });

      const { access_token, user_id } = tokenResponse.data;

      // Obtener información del usuario desde Instagram
      const userResponse = await axios.get(`https://graph.instagram.com/me`, {
        params: {
          access_token: access_token,
          fields: 'id,username,account_type'
        }
      });

      const { id: instagram_id, username, account_type } = userResponse.data;

      // Verificar si ya existe una cuenta social para este usuario y proveedor
      let socialAccount = await SocialAccount.findOne({
        where: {
          user_id: userId,
          provider: 'instagram'
        }
      });

      if (socialAccount) {
        // Actualizar tokens existentes
        await socialAccount.update({
          access_token: access_token,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
        });
      } else {
        // Crear nueva cuenta social
        socialAccount = await SocialAccount.create({
          user_id: userId,
          provider: 'instagram',
          access_token: access_token,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
          provider_user_id: instagram_id
        });
      }

      // Redirigir al frontend con parámetros de éxito
      const frontendUrl = `${process.env.FRONTEND_URL}/instagram-callback?status=success`;
      res.redirect(frontendUrl);

    } catch (error) {
      console.error('Error en Instagram callback:', error.response?.data || error.message);
      const frontendUrl = `${process.env.FRONTEND_URL}/instagram-callback?status=error&message=` + encodeURIComponent('Error al conectar cuenta de Instagram');
      res.redirect(frontendUrl);
    }
  },

  // Desconectar cuenta de Instagram
  disconnect: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const socialAccount = await SocialAccount.findOne({
        where: {
          user_id: userId,
          provider: 'instagram'
        }
      });

      if (!socialAccount) {
        return res.status(404).json({ error: 'Cuenta de Instagram no encontrada' });
      }

      await socialAccount.destroy();

      res.json({
        success: true,
        message: 'Cuenta de Instagram desconectada exitosamente'
      });

    } catch (error) {
      console.error('Error al desconectar Instagram:', error);
      res.status(500).json({ error: 'Error al desconectar cuenta de Instagram' });
    }
  },

  // Obtener estado de conexión
  getStatus: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const socialAccount = await SocialAccount.findOne({
        where: {
          user_id: userId,
          provider: 'instagram'
        }
      });

      res.json({
        connected: !!socialAccount,
        account: socialAccount
      });

    } catch (error) {
      console.error('Error al obtener estado de Instagram:', error);
      res.status(500).json({ error: 'Error al obtener estado de conexión' + error.message });
    }
  }
}; 