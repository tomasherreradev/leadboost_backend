'use strict';
const { Post, PostTarget, SocialAccount } = require('../../../models');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const socialConfig = require('../../../config/socialConfig');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FACEBOOK_APP_ID = socialConfig.facebook.appId;
const FACEBOOK_APP_SECRET = socialConfig.facebook.appSecret;
const WHATSAPP_PHONE_NUMBER_ID = socialConfig.whatsapp.phoneNumberId;
const WHATSAPP_ACCESS_TOKEN = socialConfig.whatsapp.accessToken;

// Función para subir imagen a un servicio público y obtener URL
async function uploadImageToPublicService(imageBuffer, fileName) {
  try {
    const formData = new (require('form-data'))();
    formData.append('image', imageBuffer, {
      filename: fileName,
      contentType: 'image/jpeg'
    });
    
    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Client-ID 546c25a59c58ad7'
      }
    });
    
    if (response.data.success) {
      console.log('Imagen subida a Imgur:', response.data.data.link);
      return response.data.data.link;
    } else {
      throw new Error('Error al subir imagen a Imgur');
    }
  } catch (error) {
    console.error('Error subiendo a Imgur:', error.message);
    throw new Error('No se pudo subir la imagen a un servicio público');
  }
}

module.exports = async (req, res) => {
  try {
    const { user } = req;
    const { content, title, postType, socialAccounts: socialAccountsRaw, recipients, phoneNumber } = req.body;
    const image = req.files?.image;

    if (!user?.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    let socialAccounts;
    try {
      socialAccounts = socialAccountsRaw ? JSON.parse(socialAccountsRaw) : [];
    } catch (error) {
      console.error('Error parsing socialAccounts:', error);
      return res.status(400).json({ error: 'Formato inválido para socialAccounts' });
    }

    if (!postType || !['post', 'story', 'email', 'whatsapp'].includes(postType)) {
      return res.status(400).json({ error: 'Tipo de publicación inválido' });
    }
    if (['post', 'email', 'whatsapp'].includes(postType) && !content) {
      return res.status(400).json({ error: 'El texto es requerido para publicaciones, emails o mensajes de WhatsApp' });
    }
    if (postType === 'story' && !image) {
      return res.status(400).json({ error: 'La imagen es requerida para historias' });
    }
    if (!socialAccounts || !Array.isArray(socialAccounts) || socialAccounts.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos una red social o canal' });
    }
    if (postType === 'email' && (!recipients || !Array.isArray(JSON.parse(recipients)) || JSON.parse(recipients).length === 0)) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un destinatario para emails' });
    }
    if (postType === 'whatsapp' && !phoneNumber) {
      return res.status(400).json({ error: 'Debe proporcionar un número de teléfono para WhatsApp' });
    }

    let imageUrl = null;
    let fileName = null;
    if (image) {
      fileName = `${uuidv4()}-${image.name}`;
      const filePath = path.join(__dirname, '../../../uploads', fileName);
      await image.mv(filePath);
      imageUrl = `${process.env.BACKEND_URL}/uploads/${fileName}`;
    }

    const post = await Post.create({
      user_id: user.id,
      title: title || postType.charAt(0).toUpperCase() + postType.slice(1),
      content,
      image_url: imageUrl,
    });

    const accounts = await SocialAccount.findAll({
      where: {
        user_id: user.id,
        provider: socialAccounts,
      },
    });

    if (accounts.length === 0) {
      return res.status(400).json({ error: 'No se encontraron cuentas sociales vinculadas para los proveedores seleccionados' });
    }

    const postTargets = [];
    for (const account of accounts) {
      let remotePostId = null;
      let status = 'pending';

      try {
        if (account.provider === 'facebook' && postType === 'post') {
          let pageInfo = null;
          if (account.extra_data) {
            try {
              const extraData = JSON.parse(account.extra_data);
              if (extraData.pages && extraData.pages.length > 0) {
                pageInfo = extraData.pages[0];
                console.log(`Usando página guardada: ${pageInfo.name} (ID: ${pageInfo.id})`);
              }
            } catch (error) {
              console.error('Error parsing extra_data:', error);
            }
          }

          if (!pageInfo) {
            console.log('No se encontró información de páginas guardada, obteniendo desde API...');
            const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
              params: {
                access_token: account.access_token,
                fields: 'id,name,access_token'
              }
            });
            
            if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
              pageInfo = pagesResponse.data.data[0];
              console.log(`Obtenida página desde API: ${pageInfo.name} (ID: ${pageInfo.id})`);
            } else {
              throw new Error('No se encontraron páginas de Facebook asociadas a esta cuenta');
            }
          }

          if (imageUrl) {
            console.log('Subiendo imagen a Facebook...');
            console.log('Nombre del archivo:', fileName);
            console.log('Tipo MIME:', image.mimetype);
            
            const imageBuffer = fs.readFileSync(path.join(__dirname, '../../../uploads', fileName));
            console.log('Tamaño del buffer:', imageBuffer.length, 'bytes');
            
            const FormData = require('form-data');
            const form = new FormData();
            form.append('message', content);
            form.append('access_token', pageInfo.access_token);
            form.append('source', imageBuffer, {
              filename: fileName,
              contentType: image.mimetype || 'image/jpeg'
            });
            
            console.log('FormData creado, enviando a Facebook...');
            
            const mediaResponse = await axios.post(
              `https://graph.facebook.com/v18.0/${pageInfo.id}/photos`,
              form,
              {
                headers: {
                  ...form.getHeaders(),
                },
              }
            );
            
            console.log('Respuesta de Facebook:', mediaResponse.data);
            remotePostId = mediaResponse.data.id;
          } else {
            const response = await axios.post(
              `https://graph.facebook.com/v18.0/${pageInfo.id}/feed`,
              {
                message: content,
                access_token: pageInfo.access_token,
              }
            );
            remotePostId = response.data.id;
          }
          status = 'published';
        } else if (account.provider === 'facebook' && postType === 'story') {
          if (!imageUrl) {
            throw new Error('Facebook requiere una imagen para publicar historias');
          }
        
          console.log('Subiendo historia a Facebook...');
          console.log('Nombre del archivo:', fileName);
        
          let pageInfo = null;
          if (account.extra_data) {
            try {
              const extraData = JSON.parse(account.extra_data);
              if (extraData.pages && extraData.pages.length > 0) {
                pageInfo = extraData.pages[0];
                console.log(`Usando página guardada para historia: ${pageInfo.name} (ID: ${pageInfo.id})`);
              }
            } catch (error) {
              console.error('Error parsing extra_data:', error);
            }
          }
        
          if (!pageInfo) {
            console.log('No se encontró información de páginas guardada, obteniendo desde API...');
            const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
              params: {
                access_token: account.access_token,
                fields: 'id,name,access_token'
              }
            });
            
            if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
              pageInfo = pagesResponse.data.data[0];
              console.log(`Obtenida página desde API: ${pageInfo.name} (ID: ${pageInfo.id})`);
            } else {
              throw new Error('No se encontraron páginas de Facebook asociadas a esta cuenta');
            }
          }
        
          // Verify page access token permissions
          try {
            const tokenInfo = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
              params: {
                input_token: pageInfo.access_token,
                access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
              }
            });
            console.log('Token permissions:', tokenInfo.data.data.scopes);
            if (!tokenInfo.data.data.scopes.includes('pages_manage_posts')) {
              throw new Error('El token de acceso no tiene el permiso pages_manage_posts necesario para publicar historias');
            }
          } catch (error) {
            console.error('Error verifying token permissions:', error.response?.data || error.message);
            throw new Error('No se pudo verificar los permisos del token de acceso');
          }
        
          const imageBuffer = fs.readFileSync(path.join(__dirname, '../../../uploads', fileName));
          console.log('Tamaño del buffer:', imageBuffer.length, 'bytes');
          
          console.log('Subiendo imagen a servicio público para Facebook Story...');
          const publicImageUrl = await uploadImageToPublicService(imageBuffer, fileName);
          console.log('URL pública obtenida:', publicImageUrl);
        
          console.log('Enviando solicitud a Facebook Stories API...');
          console.log('Request payload:', {
            url: publicImageUrl,
            access_token: pageInfo.access_token,
          });
          console.log('Request endpoint:', `https://graph.facebook.com/v18.0/${pageInfo.id}/stories`);
        
          const storyResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${pageInfo.id}/stories`,
            {
              url: publicImageUrl,
              access_token: pageInfo.access_token,
            }
          );
        
          console.log('Respuesta de Facebook (historia):', storyResponse.data);
          remotePostId = storyResponse.data.id;
          status = 'published';
        } else if (account.provider === 'instagram' && postType === 'post') {
          if (!imageUrl) {
            throw new Error('Instagram requiere una imagen para publicar en el feed');
          }
          
          console.log('Subiendo imagen directamente a Instagram (vía servicio público)...');
          console.log('Nombre del archivo:', fileName);
          
          const imageBuffer = fs.readFileSync(path.join(__dirname, '../../../uploads', fileName));
          console.log('Tamaño del buffer:', imageBuffer.length, 'bytes');
          
          console.log('Subiendo imagen a servicio público...');
          const publicImageUrl = await uploadImageToPublicService(imageBuffer, fileName);
          console.log('URL pública obtenida:', publicImageUrl);
          
          const mediaResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${account.provider_user_id}/media`,
            {
              image_url: publicImageUrl,
              caption: content,
              access_token: account.access_token,
            }
          );
          
          console.log('Respuesta de Instagram:', mediaResponse.data);
          const mediaId = mediaResponse.data.id;
          
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${account.provider_user_id}/media_publish`,
            {
              creation_id: mediaId,
              access_token: account.access_token,
            }
          );
          
          console.log('Respuesta de publicación:', publishResponse.data);
          remotePostId = publishResponse.data.id;
          status = 'published';
        } else if (account.provider === 'instagram' && postType === 'story') {
          if (!imageUrl) {
            throw new Error('Instagram requiere una imagen para publicar historias');
          }
          
          console.log('Subiendo historia directamente a Instagram (vía servicio público)...');
          console.log('Nombre del archivo:', fileName);
          
          const imageBuffer = fs.readFileSync(path.join(__dirname, '../../../uploads', fileName));
          console.log('Tamaño del buffer:', imageBuffer.length, 'bytes');
          
          console.log('Subiendo imagen a servicio público...');
          const publicImageUrl = await uploadImageToPublicService(imageBuffer, fileName);
          console.log('URL pública obtenida:', publicImageUrl);
          
          const mediaResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${account.provider_user_id}/media`,
            {
              media_type: 'STORIES',
              image_url: publicImageUrl,
              access_token: account.access_token,
            }
          );
          
          console.log('Respuesta de Instagram (historia):', mediaResponse.data);
          const mediaId = mediaResponse.data.id;
          
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${account.provider_user_id}/media_publish`,
            {
              creation_id: mediaId,
              access_token: account.access_token,
            }
          );
          
          console.log('Respuesta de publicación (historia):', publishResponse.data);
          remotePostId = publishResponse.data.id;
          status = 'published';
        } else if (account.provider === 'gmail' && postType === 'email') {
          console.log('Preparando envío de email a través de SendGrid...');
          
          // Obtener el subject de tres posibles fuentes
          const emailSubject = req.body.subject || req.body.title || 'Nueva Campaña';
          console.log(`Asunto del email obtenido: ${emailSubject}`);
        
          // Parsear destinatarios
          let parsedRecipients;
          try {
            parsedRecipients = JSON.parse(recipients);
            console.log(`Destinatarios: ${parsedRecipients.join(', ')}`);
          } catch (error) {
            console.error('Error al parsear destinatarios:', error);
            throw new Error('Formato inválido para los destinatarios');
          }
        
          // Configurar mensaje
          const msg = {
            to: parsedRecipients,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: emailSubject,
            text: content,
            html: imageUrl 
              ? `<p>${content}</p><img src="${imageUrl}" alt="Imagen de campaña" />`
              : `<p>${content}</p>`,
          };
        
          console.log('Detalles del mensaje:', {
            subject: msg.subject,
            to: msg.to,
            contentLength: content.length,
            hasImage: !!imageUrl
          });
        
          // Enviar email
          try {
            console.log('Enviando email...');
            await sgMail.send(msg);
            console.log('Email enviado exitosamente');
            remotePostId = 'email_sent_' + Date.now();
            status = 'published';
          } catch (error) {
            console.error('Error al enviar email:', {
              message: error.message,
              response: error.response?.body,
              stack: error.stack
            });
            status = 'error';
            throw error;
          }
        } else if (account.provider === 'whatsapp' && postType === 'whatsapp') {
          console.log('Preparando envío de mensaje de WhatsApp...');
          console.log('Número de teléfono:', phoneNumber);
          console.log('Tipo de mensaje:', imageUrl ? 'image' : 'text');
          if (imageUrl) {
            console.log('URL de la imagen:', imageUrl);
          } else {
            console.log('Contenido del mensaje:', content);
          }

          try {
            console.log('Enviando solicitud a WhatsApp API...');
            console.log('Request endpoint:', `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`);
            console.log('Request payload:', {
              messaging_product: 'whatsapp',
              to: phoneNumber,
              type: imageUrl ? 'image' : 'text',
              [imageUrl ? 'image' : 'text']: imageUrl
                ? { link: imageUrl }
                : { body: content },
            });

            const response = await axios.post(
              `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
              {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: imageUrl ? 'image' : 'text',
                [imageUrl ? 'image' : 'text']: imageUrl
                  ? { link: imageUrl }
                  : { body: content },
              },
              {
                headers: {
                  Authorization: `Bearer ${account.access_token}`,
                },
              }
            );

            console.log('Respuesta de WhatsApp API:', response.data);
            remotePostId = response.data.messages[0]?.id || 'whatsapp_sent';
            status = 'published';
            console.log('Mensaje de WhatsApp enviado exitosamente, ID:', remotePostId);
          } catch (error) {
            console.error('Error al enviar mensaje de WhatsApp:', {
              message: error.message,
              response: error.response?.data,
              stack: error.stack
            });
            status = 'error';
            throw error;
          }
        } else {
          status = 'error';
          throw new Error(`Unsupported provider or post type: ${account.provider}/${postType}`);
        }
      } catch (error) {
        console.error(`Error publishing to ${account.provider}:`, error.response?.data || error.message);
        
        let errorMessage = `Error al publicar en ${account.provider}`;
        
        if (error.response?.data?.error) {
          const fbError = error.response.data.error;
          if (fbError.code === 200) {
            errorMessage = `Error de permisos: ${fbError.message}. Asegúrate de que tu aplicación tenga los permisos necesarios y que seas administrador de la página.`;
          } else if (fbError.code === 190) {
            errorMessage = `Token de acceso inválido o expirado. Por favor, reconecta tu cuenta de ${account.provider}.`;
          } else if (fbError.code === 1500) {
            errorMessage = `Error de imagen: ${fbError.message}. Verifica que el archivo sea una imagen válida.`;
          } else if (fbError.code === 9004) {
            errorMessage = `Error de Instagram: ${fbError.message}. Verifica que la imagen sea válida y que tengas permisos para publicar.`;
          } else {
            errorMessage = `Error de Facebook: ${fbError.message}`;
          }
        }
        
        status = 'error';
        console.error(`Error detallado para ${account.provider}:`, errorMessage);
      }

      const postTarget = await PostTarget.create({
        post_id: post.id,
        social_account_id: account.id,
        provider: account.provider,
        remote_post_id: remotePostId,
        status,
        format: postType,
        extra_data: JSON.stringify({ recipients, phoneNumber }),
      });
      postTargets.push(postTarget);
    }

    return res.status(201).json({
      success: true,
      post,
      postTargets,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Error al crear la publicación' });
  }
};