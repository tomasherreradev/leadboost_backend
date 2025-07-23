const { Message, SocialAccount } = require('../../../models');

// Verificación de webhook (GET)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.FB_WEBHOOK_VERIFY_TOKEN || 'test_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[verifyWebhook] modo:', mode, 'token recibido:', token);

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[verifyWebhook] Webhook verificado correctamente.');
    return res.status(200).send(challenge);
  } else {
    console.warn('[verifyWebhook] Verificación fallida.');
    return res.sendStatus(403);
  }
};

// Recepción de mensajes (POST)
exports.handleWebhook = async (req, res) => {
  try {
    console.log('[handleWebhook] Payload recibido:', JSON.stringify(req.body, null, 2));

    const entries = req.body.entry || [];
    console.log(`[handleWebhook] Número de entries: ${entries.length}`);

    for (const entry of entries) {
      console.log('[handleWebhook] Procesando entry:', entry.id || 'sin id');
      const messaging = entry.messaging || [];
      console.log(`[handleWebhook] Número de eventos messaging: ${messaging.length}`);

      for (const event of messaging) {
        console.log('[handleWebhook] Procesando evento:', JSON.stringify(event, null, 2));

        if (event.message && event.sender && event.recipient) {
          let provider = 'facebook';
          if (event.recipient.id.startsWith('1784')) provider = 'instagram'; // Instagram IDs suelen comenzar con 1784
          console.log(`[handleWebhook] Detectado provider: ${provider}, recipient.id: ${event.recipient.id}`);

          const socialAccount = await SocialAccount.findOne({
            where: {
              provider,
              provider_user_id: event.recipient.id
            }
          });

          if (!socialAccount) {
            console.warn(`[handleWebhook] No se encontró socialAccount para provider ${provider} y recipient.id ${event.recipient.id}`);
            continue;
          }

          console.log('[handleWebhook] socialAccount encontrado:', socialAccount.toJSON());

          try {
            await Message.create({
              user_id: socialAccount.user_id,
              provider: socialAccount.provider,
              provider_message_id: event.message.mid,
              sender_id: event.sender.id,
              sender_name: '',
              recipient_id: event.recipient.id,
              recipient_name: '',
              content: event.message.text || '',
              type: event.message.attachments ? 'media' : 'text',
              timestamp: new Date(event.timestamp || Date.now()),
              extra_data: event
            });
            console.log('[handleWebhook] Mensaje guardado correctamente.');
          } catch (dbErr) {
            console.error('[handleWebhook] Error guardando mensaje:', dbErr);
          }
        } else {
          console.log('[handleWebhook] Evento sin message/sender/recipient válidos, se omite.');
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[handleWebhook] Error en webhook Facebook/Instagram:', err);
    res.sendStatus(500);
  }
};
