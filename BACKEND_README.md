# Documentación Backend LeadBost

---

## 1. Descripción general

Este backend está desarrollado con **Node.js**, **Express** y **Sequelize ORM** para MySQL.

- Las migraciones están en `/migrations`
- La configuración de Sequelize en `/config`
- Los modelos Sequelize en `/models`
- Seeds en `/seeders` (por ahora sin contenido)
- El código fuente (rutas y controladores) en `/src`
- El archivo principal de arranque es `index.js`

---

## 2. Estructura del proyecto
leadbost/backend/
├── migrations/ # Migraciones Sequelize para crear tablas
├── config/ # Configuración base para Sequelize
├── models/ # Modelos Sequelize
├── seeders/ # Seeds para datos iniciales
├── src/
│ ├── controllers/ # Controladores divididos por modelo y acción
│ │ ├── postController/
│ │ │ ├── getAll.js
│ │ │ ├── showPost.js
│ │ │ ├── storePost.js
│ │ │ ├── updatePost.js
│ │ │ └── deletePost.js
│ │ ├── socialAccountController/
│ │ ├── postTargetController/
│ │ ├── postResponseController/
│ │ └── userController/
│ └── routes/ # Rutas separadas por modelo
│ ├── postRoutes.js
│ ├── socialAccountRoutes.js
│ ├── postTargetRoutes.js
│ ├── postResponseRoutes.js
│ └── userRoutes.js
├── index.js # Servidor Express principal
├── package.json
└── .env # Variables de entorno (no incluido en repo)


## 3. Modelos y su propósito

### 3.1 `User`

- Tabla: `users`
- Campos principales: `id`, `email`, `password_hash`, `created_at`, `updated_at`
- Propósito: Representa a los usuarios de la aplicación.  
- Relaciones:  
  - Tiene muchas `SocialAccount` (cuentas sociales vinculadas)  
  - Tiene muchas `Post` (publicaciones creadas)

---

### 3.2 `SocialAccount`

- Tabla: `social_accounts`
- Campos principales: `id`, `user_id`, `provider` (facebook, instagram, x, gmail), `access_token`, `refresh_token`, `expires_at`
- Propósito: Guarda las cuentas sociales vinculadas por el usuario, con sus tokens de acceso.
- Relaciones:  
  - Pertenece a un `User`  
  - Tiene muchas `PostTarget` (objetivos de publicación en esta cuenta)

---

### 3.3 `Post`

- Tabla: `posts`
- Campos principales: `id`, `user_id`, `title`, `content`, `image_url`
- Propósito: Contiene las publicaciones centralizadas que el usuario quiere compartir.
- Relaciones:  
  - Pertenece a un `User`  
  - Tiene muchas `PostTarget` (las publicaciones enviadas a cada red social)

---

### 3.4 `PostTarget`

- Tabla: `post_targets`
- Campos principales:  
  - `id`, `post_id`, `social_account_id`, `provider`, `remote_post_id` (id de publicación en la red social),  
  - `status` (published, failed, etc), `format` (post, story, tweet, etc), `extra_data` (JSON para detalles adicionales)
- Propósito: Guarda el estado de la publicación para cada red social vinculada.
- Relaciones:  
  - Pertenece a un `Post`  
  - Pertenece a un `SocialAccount`  
  - Tiene muchas `PostResponse` (comentarios y respuestas recibidas)

---

### 3.5 `PostResponse`

- Tabla: `post_responses`
- Campos principales:  
  - `id`, `post_target_id`, `remote_comment_id`, `author_name`, `message`, `type` (comment, like, reply), `provider`
- Propósito: Guarda los comentarios, likes o respuestas recibidas a una publicación en redes sociales.
- Relaciones:  
  - Pertenece a un `PostTarget`

---

## 4. Estructura de controladores y rutas

Cada modelo tiene un folder bajo `/src/controllers/<modelo>Controller/` con los controladores separados por acción:

- `getAll.js` (lista todos)
- `show<Model>.js` (detalle por id)
- `store<Model>.js` (crear)
- `update<Model>.js` (actualizar)
- `delete<Model>.js` (eliminar)

Los routers se encuentran en `/src/routes/` y exportan un `Router` de Express que mapea las rutas REST estándar:

- `GET /` → listar
- `GET /:id` → obtener detalle
- `POST /` → crear
- `PUT /:id` → actualizar
- `DELETE /:id` → eliminar

Ejemplo: `src/routes/userRoutes.js` usa controladores de `src/controllers/userController/`

---

## 5. Archivo principal `index.js`

Carga los routers y configura Express:

```js
const express = require('express');
const app = express();

const userRoutes = require('./src/routes/userRoutes');
const socialAccountRoutes = require('./src/routes/socialAccountRoutes');
const postRoutes = require('./src/routes/postRoutes');
const postTargetRoutes = require('./src/routes/postTargetRoutes');
const postResponseRoutes = require('./src/routes/postResponseRoutes');

app.use(express.json());

app.use('/users', userRoutes);
app.use('/social-accounts', socialAccountRoutes);
app.use('/posts', postRoutes);
app.use('/post-targets', postTargetRoutes);
app.use('/post-responses', postResponseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
