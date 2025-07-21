const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando sistema de autenticación...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ No se encontró el archivo .env');
  console.log('📝 Crea un archivo .env en la carpeta backend/ con las siguientes variables:');
  console.log(`
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password_mysql
DB_NAME=leadbost
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_minimo_32_caracteres
RESEND_API_KEY=tu_resend_api_key_aqui
FRONTEND_URL=http://localhost:5173
  `);
  process.exit(1);
}

console.log('✅ Archivo .env encontrado');

// Ejecutar migraciones
try {
  console.log('📊 Ejecutando migraciones...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  console.log('✅ Migraciones ejecutadas correctamente');
} catch (error) {
  console.log('❌ Error ejecutando migraciones:', error.message);
  console.log('💡 Asegúrate de que:');
  console.log('   - MySQL esté ejecutándose');
  console.log('   - Las credenciales en .env sean correctas');
  console.log('   - La base de datos "leadbost" exista');
  process.exit(1);
}

console.log('\n🎉 Sistema de autenticación configurado correctamente!');
console.log('\n📋 Próximos pasos:');
console.log('1. Inicia el servidor backend: npm run dev');
console.log('2. Inicia el frontend: cd ../frontend && npm run dev');
console.log('3. Accede a http://localhost:5173 para probar el sistema');
console.log('\n🔐 Recuerda configurar tu API Key de Resend para el envío de emails');