'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero eliminar las columnas antiguas si existen
    try {
      await queryInterface.removeColumn('users', 'created_at');
    } catch (error) {
      // La columna no existe, continuar
    }
    
    try {
      await queryInterface.removeColumn('users', 'updated_at');
    } catch (error) {
      // La columna no existe, continuar
    }

    // Agregar las nuevas columnas con nombres correctos
    await queryInterface.addColumn('users', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('users', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir los cambios
    await queryInterface.removeColumn('users', 'createdAt');
    await queryInterface.removeColumn('users', 'updatedAt');
    
    // Restaurar las columnas originales
    await queryInterface.addColumn('users', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
