const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const socialAccountRoutes = require('./src/routes/socialAccountRoutes');
const postRoutes = require('./src/routes/postRoutes');
const postTargetRoutes = require('./src/routes/postTargetRoutes');
const postResponseRoutes = require('./src/routes/postResponseRoutes');
const facebookRoutes = require('./src/routes/facebookRoutes');
const instagramRoutes = require('./src/routes/instagramRoutes');
const gmailRoutes = require('./src/routes/gmailRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');
const mailListRoutes = require('./src/routes/mailListRoutes');
const path = require('path');
dotenv.config();

// Webhook routes
const webhookFacebookInstagram = require('./src/routes/webhookFacebookInstagram');
const webhookWhatsapp = require('./src/routes/webhookWhatsapp');
const webhookGmail = require('./src/routes/webhookGmail');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Otras rutas
app.use('/api/users', userRoutes);
app.use('/api/social-accounts', socialAccountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/post-targets', postTargetRoutes);
app.use('/api/post-responses', postResponseRoutes);
app.use('/api/mail-lists', mailListRoutes);

// Rutas de redes sociales
app.use('/api/social/facebook', facebookRoutes);
app.use('/api/social/instagram', instagramRoutes);
app.use('/api/social/gmail', gmailRoutes);
app.use('/api/social/whatsapp', whatsappRoutes);

// Webhook endpoints
app.use('/webhook/facebook-instagram', webhookFacebookInstagram);
app.use('/webhook/whatsapp', webhookWhatsapp);
app.use('/webhook/gmail', webhookGmail);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
