console.log('=== CONFIGURACIÓN WEBHOOK FACEBOOK/INSTAGRAM ===');
console.log('');

// URLs del webhook para producción
const productionUrl = 'https://leadboost-backend.onrender.com';
console.log('URL del webhook en producción:');
console.log(`${productionUrl}/webhook/facebook-instagram`);
console.log('');

console.log('CONFIGURACIÓN EN META DEVELOPER CONSOLE:');
console.log('1. Ve a https://developers.facebook.com/');
console.log('2. Selecciona tu aplicación');
console.log('3. Ve a "Webhooks" en el menú lateral');
console.log('4. Haz clic en "Add Callback URL"');
console.log('5. URL del webhook:', `${productionUrl}/webhook/facebook-instagram`);
console.log('6. Verify Token: test_token');
console.log('7. Suscríbete a los siguientes campos:');
console.log('   - messages');
console.log('   - messaging_postbacks');
console.log('   - message_deliveries');
console.log('   - message_reads');
console.log('');

console.log('PARA VERIFICAR QUE FUNCIONA:');
console.log('1. Prueba el endpoint de test:');
console.log(`   ${productionUrl}/webhook/facebook-instagram/test`);
console.log('');
console.log('2. Verifica la verificación del webhook:');
console.log(`   ${productionUrl}/webhook/facebook-instagram?hub.mode=subscribe&hub.verify_token=test_token&hub.challenge=test`);
console.log('');

console.log('=== FIN ==='); 