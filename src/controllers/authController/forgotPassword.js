const crypto = require('crypto');
const { Resend } = require('resend');
const { User } = require('../../../models');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que se proporcione email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Crear enlace de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar email usando Resend
    try {
    console.log('[LOG] Enviando email a:', email);
    console.log('[LOG] Reset URL:', resetUrl);

      const response = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['herreratomas270@gmail.com'],
        subject: 'Email de prueba',
        html: '<p>Esto es un test en modo desarrollo</p>',
      });
      

      console.log('[LOG] Respuesta de Resend:', response);

      if (response.error) {
        console.error('[ERROR] Resend devolvió error:', response.error);
    
        // Limpiar token si falla el envío
        await user.update({
          reset_token: null,
          reset_token_expires: null
        });
    
        return res.status(500).json({
          success: false,
          message: 'Error enviando el email de recuperación'
        });
      }
    
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    
    } catch (emailError) {
      console.error('[ERROR] Excepción al enviar email:', emailError);
    
      // Limpiar token si falla el envío
      await user.update({
        reset_token: null,
        reset_token_expires: null
      });
    
      return res.status(500).json({
        success: false,
        message: 'Error enviando el email de recuperación'
      });
    }
  } catch (error) {
    console.error('[ERROR] Error en forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = forgotPassword; 