const { Message, SocialAccount } = require('../../../models');
const crypto = require('crypto');

// Endpoint de prueba para verificar que el webhook esté funcionando
exports.testWebhook = (req, res) => {
  console.log('[testWebhook] Endpoint de prueba llamado');
  res.json({
    status: 'success',
    message: 'Webhook Facebook/Instagram está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// Verificación de webhook (GET)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.FB_WEBHOOK_VERIFY_TOKEN || 'test_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[verifyWebhook] modo:', mode, 'token recibido:', token, 'challenge:', challenge);

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[verifyWebhook] Webhook verificado correctamente.');
    return res.status(200).send(challenge);
  } else {
    console.warn('[verifyWebhook] Verificación fallida.');
    console.warn('[verifyWebhook] Mode:', mode, 'Token:', token, 'Expected:', VERIFY_TOKEN);
    return res.sendStatus(403);
  }
};

// Función para verificar la firma del webhook
const verifySignature = (req) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    console.warn('[verifySignature] No se encontró firma en el header');
    return true; // Permitir sin verificación si no está configurado
  }

  const appSecret = process.env.FB_APP_SECRET;
  if (!appSecret) {
    console.warn('[verifySignature] No se configuró FB_APP_SECRET');
    return true; // Permitir sin verificación si no está configurado
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  console.log('[verifySignature] Firma válida:', isValid);
  return isValid;
};

// Recepción de mensajes (POST)
exports.handleWebhook = async (req, res) => {
  try {
    console.log('=== WEBHOOK RECIBIDO ===');
    console.log('[handleWebhook] Headers recibidos:', JSON.stringify(req.headers, null, 2));
    console.log('[handleWebhook] Payload recibido:', JSON.stringify(req.body, null, 2));
    console.log('=== FIN WEBHOOK ===');

    // Verificar firma si está configurado
    // if (!verifySignature(req)) {
    //   console.error('[handleWebhook] Firma inválida');
    //   return res.sendStatus(403);
    // }

    const entries = req.body.entry || [];
    console.log(`[handleWebhook] Número de entries: ${entries.length}`);

    if (entries.length === 0) {
      console.warn('[handleWebhook] No se recibieron entries en el payload');
      return res.sendStatus(200);
    }

    for (const entry of entries) {
      console.log('[handleWebhook] Procesando entry:', entry.id || 'sin id');
      console.log('[handleWebhook] Keys del entry:', Object.keys(entry));
      
      // Manejar diferentes tipos de eventos
      if (entry.messaging) {
        console.log('[handleWebhook] Procesando eventos de messaging');
        await processMessagingEvents(entry.messaging);
      } else if (entry.changes) {
        console.log('[handleWebhook] Procesando eventos de changes');
        await processChangesEvents(entry.changes);
      } else {
        console.log('[handleWebhook] Tipo de evento no reconocido:', Object.keys(entry));
        console.log('[handleWebhook] Entry completo:', JSON.stringify(entry, null, 2));
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[handleWebhook] Error en webhook Facebook/Instagram:', err);
    res.sendStatus(500);
  }
};

// Procesar eventos de messaging
const processMessagingEvents = async (messaging) => {
  console.log(`[processMessagingEvents] Número de eventos messaging: ${messaging.length}`);

  for (const event of messaging) {
    console.log('[processMessagingEvents] Procesando evento:', JSON.stringify(event, null, 2));

    if (event.message && event.sender && event.recipient) {
      let provider = 'facebook';
      if (event.recipient.id.startsWith('1784')) provider = 'instagram';
      console.log(`[processMessagingEvents] Detectado provider: ${provider}, recipient.id: ${event.recipient.id}`);

      // Buscar la cuenta social correspondiente
      const socialAccount = await SocialAccount.findOne({
        where: {
          provider,
          provider_user_id: event.recipient.id
        }
      });

      if (!socialAccount) {
        console.warn(`[processMessagingEvents] No se encontró socialAccount para provider ${provider} y recipient.id ${event.recipient.id}`);
        console.log('[processMessagingEvents] Buscando todas las cuentas sociales...');
        const allAccounts = await SocialAccount.findAll();
        console.log('[processMessagingEvents] Todas las cuentas sociales:', allAccounts.map(acc => ({
          id: acc.id,
          provider: acc.provider,
          provider_user_id: acc.provider_user_id,
          user_id: acc.user_id
        })));
        continue;
      }

      console.log('[processMessagingEvents] socialAccount encontrado:', socialAccount.toJSON());

      const senderId = event.sender.id;
      let senderName = '';

      try {
        const userProfileRes = await axios.get(`https://graph.facebook.com/v18.0/${senderId}`, {
          params: {
            access_token: socialAccount.access_token,
            fields: 'first_name,last_name'
          }
        });

        const profile = userProfileRes.data;
        senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        console.log('[processMessagingEvents] Nombre del remitente obtenido:', senderName);
      } catch (err) {
        console.warn('[processMessagingEvents] No se pudo obtener el nombre del remitente:', err.message);
      }



      try {
        const messageData = {
          user_id: socialAccount.user_id,
          provider: socialAccount.provider,
          provider_message_id: event.message.mid,
          sender_id: event.sender.id,
          sender_name: senderName || '',
          recipient_id: event.recipient.id,
          recipient_name: '',
          content: event.message.text || '',
          type: event.message.attachments ? 'media' : 'text',
          timestamp: new Date(event.timestamp || Date.now()),
          extra_data: event
        };

        console.log('[processMessagingEvents] Intentando guardar mensaje:', messageData);

        const savedMessage = await Message.create(messageData);
        console.log('[processMessagingEvents] Mensaje guardado correctamente. ID:', savedMessage.id);
      } catch (dbErr) {
        console.error('[processMessagingEvents] Error guardando mensaje:', dbErr);
        console.error('[processMessagingEvents] Detalles del error:', {
          name: dbErr.name,
          message: dbErr.message,
          code: dbErr.code
        });
      }
    } else {
      console.log('[processMessagingEvents] Evento sin message/sender/recipient válidos, se omite.');
      console.log('[processMessagingEvents] Evento completo:', JSON.stringify(event, null, 2));
    }
  }
};

// Procesar eventos de changes (para Instagram)
const processChangesEvents = async (changes) => {
  console.log(`[processChangesEvents] Número de cambios: ${changes.length}`);

  for (const change of changes) {
    console.log('[processChangesEvents] Procesando cambio:', JSON.stringify(change, null, 2));
    
    if (change.value && change.value.messages) {
      for (const message of change.value.messages) {
        console.log('[processChangesEvents] Procesando mensaje de Instagram:', JSON.stringify(message, null, 2));
        
        // Buscar la cuenta social correspondiente
        const socialAccount = await SocialAccount.findOne({
          where: {
            provider: 'instagram',
            provider_user_id: change.value.metadata.phone_number_id || change.value.metadata.instagram_business_account_id
          }
        });

        if (!socialAccount) {
          console.warn('[processChangesEvents] No se encontró socialAccount para Instagram');
          continue;
        }

        try {
          const messageData = {
            user_id: socialAccount.user_id,
            provider: 'instagram',
            provider_message_id: message.id,
            sender_id: message.from,
            sender_name: '',
            recipient_id: message.to,
            recipient_name: '',
            content: message.text?.body || '',
            type: message.type || 'text',
            timestamp: new Date(message.timestamp || Date.now()),
            extra_data: message
          };

          console.log('[processChangesEvents] Intentando guardar mensaje de Instagram:', messageData);

          const savedMessage = await Message.create(messageData);
          console.log('[processChangesEvents] Mensaje de Instagram guardado correctamente. ID:', savedMessage.id);
        } catch (dbErr) {
          console.error('[processChangesEvents] Error guardando mensaje de Instagram:', dbErr);
        }
      }
    }
  }
};
