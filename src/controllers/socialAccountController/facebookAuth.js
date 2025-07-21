const { SocialAccount } = require('../../../models');
const axios = require('axios');
const socialConfig = require('../../../config/socialConfig');
const dotenv = require('dotenv');
dotenv.config();

const FACEBOOK_APP_ID = socialConfig.facebook.appId;
const BUSINESS_ID = '1722016665372395';
const FACEBOOK_APP_SECRET = socialConfig.facebook.appSecret;

module.exports = {
  // Generar URL de autorización de Facebook
  getAuthUrl: (req, res) => {
    const redirectUri = `https://leadboostappp.netlify.app/api/social/facebook/callback`;

    const scopes = [
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'instagram_basic',
      'instagram_manage_insights',
      'instagram_content_publish',
      'business_management'
    ];
    
    const state = encodeURIComponent(JSON.stringify({ userId: req.user.id }));
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join(',')}&state=${state}`;

    res.json({ authUrl });
  },

  // Manejar el callback de Facebook

  handleCallback: async (req, res) => {
    try {
      console.log('--- Facebook callback iniciada ---');
      const { code, state } = req.query;
      console.log('Query params:', { code, state });
  
      if (!code) {
        console.error('No se proporcionó código de autorización');
        return res.status(400).json({ error: 'Código de autorización no proporcionado' });
      }
  
      const parsedState = JSON.parse(state);
      console.log('Estado parseado:', parsedState);
  
      const userId = parsedState?.userId;
      if (!userId) {
        console.error('Usuario no autenticado (userId faltante en state)');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      const redirectUri = `https://leadboostappp.netlify.app/api/social/facebook/callback`;
      console.log('Redirect URI:', redirectUri);
  
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: redirectUri,
          code: code
        }
      });
      console.log('Token response:', tokenResponse.data);
  
      const { access_token, expires_in } = tokenResponse.data;
      if (!access_token) {
        console.error('No se recibió access_token en la respuesta');
        return res.status(400).json({ error: 'No se recibió access_token' });
      }
  
      const userResponse = await axios.get('https://graph.facebook.com/me', {
        params: {
          access_token,
          fields: 'id,name,email'
        }
      });
      console.log('Datos usuario Facebook:', userResponse.data);
  
      const { id: facebook_id, name, email } = userResponse.data;
  
      let socialAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'facebook' }
      });
  
      let expiresInSeconds = expires_in || 60 * 24 * 60 * 60;
      const facebookExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  
      // 👉 Obtener las páginas desde el negocio
      const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/${BUSINESS_ID}/owned_pages`, {
        params: {
          access_token,
          fields: 'id,name,access_token'
        }
      });
  
      console.log('Páginas obtenidas desde el negocio:', pagesResponse.data.data);
      const pages = pagesResponse.data.data;
      
      // Guardar información de las páginas en extra_data
      const extraData = {
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          access_token: page.access_token
        }))
      };
  
      if (socialAccount) {
        await socialAccount.update({
          access_token,
          expires_at: facebookExpiresAt,
          provider_user_id: facebook_id,
          extra_data: JSON.stringify(extraData)
        });
        console.log('Cuenta Facebook actualizada');
      } else {
        socialAccount = await SocialAccount.create({
          user_id: userId,
          provider: 'facebook',
          provider_user_id: facebook_id,
          access_token,
          expires_at: facebookExpiresAt,
          extra_data: JSON.stringify(extraData)
        });
        console.log('Cuenta Facebook creada');
      }
  
      let igAccountSaved = false;
      for (const page of pages) {
        console.log(`Revisando página: ${page.name} (ID: ${page.id})`);
  
        const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
          params: {
            access_token: page.access_token,
            fields: 'instagram_business_account'
          }
        });
  
        const igBusinessAccountId = igResponse.data.instagram_business_account?.id;
        if (igBusinessAccountId) {
          const igDetails = await axios.get(`https://graph.facebook.com/v18.0/${igBusinessAccountId}`, {
            params: {
              access_token: page.access_token,
              fields: 'username,profile_picture_url'
            }
          });
  
          const { username, profile_picture_url } = igDetails.data;
  
          let igAccount = await SocialAccount.findOne({
            where: { user_id: userId, provider: 'instagram' }
          });
  
          const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const extraData = {
            username,
            profile_picture_url,
            page_id: page.id,
            page_name: page.name
          };
  
          if (igAccount) {
            await igAccount.update({
              provider_user_id: igBusinessAccountId,
              access_token: page.access_token,
              expires_at: expiresAt,
              extra_data: JSON.stringify(extraData)
            });
            console.log('Cuenta Instagram actualizada');
          } else {
            await SocialAccount.create({
              user_id: userId,
              provider: 'instagram',
              provider_user_id: igBusinessAccountId,
              access_token: page.access_token,
              expires_at: expiresAt,
              extra_data: JSON.stringify(extraData)
            });
            console.log('Cuenta Instagram creada');
          }
  
          igAccountSaved = true;
          break;
        }
      }
  
      if (!igAccountSaved) {
        console.log('No se encontró ninguna cuenta de Instagram Business vinculada a las páginas del negocio');
      }
  
      res.redirect(`${process.env.FRONTEND_URL}/facebook-callback?status=success`);
    } catch (error) {
      console.error('Error en Facebook callback:', error.response?.data || error.message);
      res.redirect(
        `${process.env.FRONTEND_URL}/facebook-callback?status=error&message=` +
          encodeURIComponent('Error al conectar cuenta de Facebook o Instagram')
      );
    }
  },
  

  // Desconectar cuenta
  disconnect: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

      const accounts = await SocialAccount.findAll({ where: { user_id: userId } });
      for (const account of accounts) {
        await account.destroy();
      }

      res.json({ success: true, message: 'Cuentas sociales desconectadas exitosamente' });

    } catch (error) {
      console.error('Error al desconectar:', error);
      res.status(500).json({ error: 'Error al desconectar cuentas' });
    }
  },

  // Estado de conexión
  getStatus: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log('Obteniendo estado de conexión para userId:', userId);
      if (!userId) {
        console.warn('Usuario no autenticado (userId faltante)');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      const facebookAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'facebook' }
      });
      console.log('Cuenta Facebook encontrada:', facebookAccount ? facebookAccount.id : null);
  
      const instagramAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'instagram' }
      });
      console.log('Cuenta Instagram encontrada:', instagramAccount ? instagramAccount.id : null);
  
      res.json({
        facebook: !!facebookAccount,
        instagram: !!instagramAccount,
        accounts: { facebook: facebookAccount, instagram: instagramAccount }
      });
  
    } catch (error) {
      console.error('Error al obtener estado de conexión:', error);
      res.status(500).json({ error: 'Error al obtener estado de conexión' });
    }
  }
  
};
