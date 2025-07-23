const { Message, SocialAccount } = require('../../../models');

// Verificación de webhook (GET)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.WSP_WEBHOOK_VERIFY_TOKEN || 'test_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

// Recepción de mensajes (POST)
exports.handleWebhook = async (req, res) => {
  try {
    const entries = req.body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value && change.value.messages;
        if (messages && Array.isArray(messages)) {
          for (const msg of messages) {
            // phone_number_id es el identificador de la instancia de WhatsApp Business
            const phoneNumberId = change.value.metadata?.phone_number_id;
            const socialAccount = await SocialAccount.findOne({
              where: {
                provider: 'whatsapp',
                provider_user_id: phoneNumberId
              }
            });
            if (!socialAccount) continue;

            await Message.create({
              user_id: socialAccount.user_id,
              provider: 'whatsapp',
              provider_message_id: msg.id,
              sender_id: msg.from,
              sender_name: '',
              recipient_id: phoneNumberId,
              recipient_name: '',
              content: msg.text?.body || '',
              type: msg.type || 'text',
              timestamp: new Date(Number(msg.timestamp) * 1000),
              extra_data: msg
            });
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en webhook WhatsApp:', err);
    res.sendStatus(500);
  }
};
