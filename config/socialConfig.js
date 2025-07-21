const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  facebook: {
    appId: process.env.META_FACEBOOK_APP_ID,
    appSecret: process.env.META_FACEBOOK_APP_SECRET
  },
  instagram: {
    appId: process.env.META_INSTAGRAM_APP_ID,
    appSecret: process.env.META_INSTAGRAM_APP_SECRET
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN
  }
}; 