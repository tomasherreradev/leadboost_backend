const { SocialAccount } = require('../../../models');
const axios = require('axios');
const socialConfig = require('../../../config/socialConfig');
const dotenv = require('dotenv');
dotenv.config();

const WHATSAPP_PHONE_NUMBER_ID = socialConfig.whatsapp?.phoneNumberId;
if(!WHATSAPP_PHONE_NUMBER_ID) {
  throw new Error('WHATSAPP_PHONE_NUMBER_ID no está definido en el archivo de configuración');
}
const WHATSAPP_ACCESS_TOKEN = socialConfig.whatsapp?.accessToken;
if(!WHATSAPP_ACCESS_TOKEN) {
  throw new Error('WHATSAPP_ACCESS_TOKEN no está definido en el archivo de configuración');
}

module.exports = {
  // Generar URL de autorización de WhatsApp (simulado)
  getAuthUrl: (req, res) => {
    // WhatsApp Business API no usa OAuth tradicional
    // En su lugar, verificamos si el usuario tiene un número configurado
    const state = encodeURIComponent(JSON.stringify({ userId: req.user.id }));
    
    // Para WhatsApp, podríamos redirigir a una página de configuración
    const authUrl = `${process.env.FRONTEND_URL}/whatsapp-setup?state=${state}`;
    
    res.json({ authUrl });
  },

  // Manejar el callback de WhatsApp (simulado)
  handleCallback: async (req, res) => {
    try {
      console.log('--- WhatsApp callback iniciada ---');
      const { phoneNumber, state } = req.query;
      console.log('Query params:', { phoneNumber, state });
  
      if (!phoneNumber) {
        console.error('No se proporcionó número de teléfono');
        return res.status(400).json({ error: 'Número de teléfono no proporcionado' });
      }
  
      const parsedState = JSON.parse(state);
      console.log('Estado parseado:', parsedState);
  
      const userId = parsedState?.userId;
      if (!userId) {
        console.error('Usuario no autenticado (userId faltante en state)');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      // Verificar si el número de WhatsApp está disponible
      try {
        const verifyResponse = await axios.get(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}`, {
          params: {
            access_token: WHATSAPP_ACCESS_TOKEN,
            fields: 'verified_name,code_verification_status'
          }
        });
        
        console.log('Verificación WhatsApp:', verifyResponse.data);
      } catch (error) {
        console.error('Error al verificar número de WhatsApp:', error.response?.data || error.message);
        return res.status(400).json({ error: 'Número de WhatsApp no válido' });
      }
  
      let socialAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'whatsapp' }
      });
  
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 días
      const extraData = {
        phone_number: phoneNumber,
        verified: true
      };
  
      if (socialAccount) {
        await socialAccount.update({
          provider_user_id: phoneNumber,
          access_token: WHATSAPP_ACCESS_TOKEN,
          expires_at: expiresAt,
          extra_data: JSON.stringify(extraData)
        });
        console.log('Cuenta WhatsApp actualizada');
      } else {
        await SocialAccount.create({
          user_id: userId,
          provider: 'whatsapp',
          provider_user_id: phoneNumber,
          access_token: WHATSAPP_ACCESS_TOKEN,
          expires_at: expiresAt,
          extra_data: JSON.stringify(extraData)
        });
        console.log('Cuenta WhatsApp creada');
      }
  
      res.redirect(`${process.env.FRONTEND_URL}/whatsapp-callback?status=success`);
    } catch (error) {
      console.error('Error en WhatsApp callback:', error.response?.data || error.message);
      res.redirect(
        `${process.env.FRONTEND_URL}/whatsapp-callback?status=error&message=` +
          encodeURIComponent('Error al conectar cuenta de WhatsApp')
      );
    }
  },

  // Desconectar cuenta
  disconnect: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

      const whatsappAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'whatsapp' }
      });

      if (whatsappAccount) {
        await whatsappAccount.destroy();
        console.log('Cuenta WhatsApp desconectada');
      }

      res.json({ success: true, message: 'Cuenta de WhatsApp desconectada exitosamente' });

    } catch (error) {
      console.error('Error al desconectar WhatsApp:', error);
      res.status(500).json({ error: 'Error al desconectar cuenta de WhatsApp' });
    }
  },

  // Estado de conexión
  getStatus: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log('Obteniendo estado de conexión de WhatsApp para userId:', userId);
      if (!userId) {
        console.warn('Usuario no autenticado (userId faltante)');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      const whatsappAccount = await SocialAccount.findOne({
        where: { user_id: userId, provider: 'whatsapp' }
      });
      console.log('Cuenta WhatsApp encontrada:', whatsappAccount ? whatsappAccount.id : null);
  
      res.json({
        connected: !!whatsappAccount,
        account: whatsappAccount
      });
  
    } catch (error) {
      console.error('Error al obtener estado de conexión de WhatsApp:', error);
      res.status(500).json({ error: 'Error al obtener estado de conexión' });
    }
  }
}; 