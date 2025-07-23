const dotenv = require('dotenv');
dotenv.config();

console.log('=== DEBUG WEBHOOK FACEBOOK/INSTAGRAM ===');
console.log('');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log('- FB_WEBHOOK_VERIFY_TOKEN:', process.env.FB_WEBHOOK_VERIFY_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
console.log('- FB_APP_SECRET:', process.env.FB_APP_SECRET ? 'Configurado' : 'NO CONFIGURADO');
console.log('- PORT:', process.env.PORT || 5000);
console.log('');

// URLs del webhook para producción
const productionUrl = 'https://leadboost-backend.onrender.com';
console.log('URLs del webhook (PRODUCCIÓN):');
console.log('- Verificación:', `${productionUrl}/webhook/facebook-instagram`);
console.log('- Recepción:', `${productionUrl}/webhook/facebook-instagram`);
console.log('- Prueba:', `${productionUrl}/webhook/facebook-instagram/test`);
console.log('');

// URLs del webhook para desarrollo local
const localUrl = `http://localhost:${process.env.PORT || 5000}`;
console.log('URLs del webhook (DESARROLLO LOCAL):');
console.log('- Verificación:', `${localUrl}/webhook/facebook-instagram`);
console.log('- Recepción:', `${localUrl}/webhook/facebook-instagram`);
console.log('- Prueba:', `${localUrl}/webhook/facebook-instagram/test`);
console.log('');

// Instrucciones para Meta Developer Console
console.log('CONFIGURACIÓN EN META DEVELOPER CONSOLE:');
console.log('1. Ve a https://developers.facebook.com/');
console.log('2. Selecciona tu aplicación');
console.log('3. Ve a "Webhooks" en el menú lateral');
console.log('4. Haz clic en "Add Callback URL"');
console.log('5. URL del webhook:', `${productionUrl}/webhook/facebook-instagram`);
console.log('6. Verify Token:', process.env.FB_WEBHOOK_VERIFY_TOKEN || 'test_token');
console.log('7. Suscríbete a los siguientes campos:');
console.log('   - messages');
console.log('   - messaging_postbacks');
console.log('   - message_deliveries');
console.log('   - message_reads');
console.log('');

// Verificar que el servidor esté corriendo
console.log('COMANDOS PARA VERIFICAR:');
console.log('1. Verificar que el servidor esté funcionando:');
console.log(`   curl ${productionUrl}/webhook/facebook-instagram/test`);
console.log('');
console.log('2. Verificar la verificación del webhook:');
console.log(`   curl "${productionUrl}/webhook/facebook-instagram?hub.mode=subscribe&hub.verify_token=${process.env.FB_WEBHOOK_VERIFY_TOKEN || 'test_token'}&hub.challenge=test"`);
console.log('');

// Problemas comunes
console.log('PROBLEMAS COMUNES Y SOLUCIONES:');
console.log('1. Si el webhook no se ejecuta:');
console.log('   - Verifica que la URL en Meta Developer Console sea exactamente:', `${productionUrl}/webhook/facebook-instagram`);
console.log('   - Asegúrate de que el Verify Token coincida con FB_WEBHOOK_VERIFY_TOKEN');
console.log('   - Verifica que el servidor esté corriendo en Render');
console.log('');
console.log('2. Si los mensajes no se guardan:');
console.log('   - Verifica que la tabla Messages exista en la base de datos');
console.log('   - Verifica que las cuentas sociales estén conectadas correctamente');
console.log('   - Revisa los logs del servidor en Render');
console.log('');

console.log('=== FIN DEBUG ==='); 