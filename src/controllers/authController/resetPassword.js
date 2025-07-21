const bcrypt = require('bcryptjs');
const { User } = require('../../../models');

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validar que se proporcionen token y password
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario por token de reset
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Actualizar contraseña y limpiar token
    await user.update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires: null
    });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = resetPassword; 