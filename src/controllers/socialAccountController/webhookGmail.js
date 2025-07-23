const { Message, SocialAccount } = require('../../../models');

// Recepción de notificaciones push o polling (POST)
exports.handleWebhook = async (req, res) => {
  try {
    // Aquí deberías recibir la notificación push de Gmail o los datos del polling
    const emails = req.body.emails || [];
    for (const email of emails) {
      // Buscar el usuario dueño de la cuenta (debes adaptar este mapeo)
      const user = await User.findOne({ where: { /* tu lógica de mapeo */ } });
      if (!user) continue;

      await Message.create({
        user_id: user.id,
        provider: 'gmail',
        provider_message_id: email.id,
        sender_id: email.from,
        sender_name: email.fromName || '',
        recipient_id: email.to,
        recipient_name: email.toName || '',
        content: email.body || '',
        type: 'email',
        timestamp: new Date(email.date),
        extra_data: email
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en webhook Gmail:', err);
    res.sendStatus(500);
  }
};
