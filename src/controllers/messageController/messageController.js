const { Message } = require('../../../models');

// GET /api/messages?provider=facebook|instagram
exports.getMessagesByUser = async (req, res) => {
  try {
    console.log('🔍 getMessagesByUser called');
    
    if (!req.user || !req.user.id) {
      console.warn('⚠️ Usuario no autenticado o req.user.id no definido');
      return res.status(401).json([]);
    }

    const userId = req.user.id;
    const provider = req.query.provider;
    const where = { user_id: userId };

    console.log(`📥 Parámetros recibidos: userId=${userId}, provider=${provider}`);

    if (provider) {
      where.provider = provider;
    }

    console.log('📦 Filtros aplicados en la query:', where);

    const messages = await Message.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });

    console.log(`✅ ${messages.length} mensaje(s) encontrados`);
    res.json(Array.isArray(messages) ? messages : []);
  } catch (err) {
    console.error('❌ Error al obtener los mensajes:', err);
    res.status(200).json([]);
  }
};
