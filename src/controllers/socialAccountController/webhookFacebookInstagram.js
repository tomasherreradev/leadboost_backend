const { Message, SocialAccount } = require('../../../models');

// Verificación de webhook (GET)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.FB_WEBHOOK_VERIFY_TOKEN || 'test_token';
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
      const messaging = entry.messaging || [];
      for (const event of messaging) {
        if (event.message && event.sender && event.recipient) {
          let provider = 'facebook';
          if (event.recipient.id.startsWith('1784')) provider = 'instagram'; // Instagram IDs suelen comenzar con 1784
          const socialAccount = await SocialAccount.findOne({
            where: {
              provider,
              provider_user_id: event.recipient.id
            }
          });
          if (!socialAccount) continue;

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
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en webhook Facebook/Instagram:', err);
    res.sendStatus(500);
  }
};
