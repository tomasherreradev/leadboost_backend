const express = require("express");
const router = express.Router();

const createMailList = require("../controllers/mailListController/createMailList");
const getAllMailLists = require("../controllers/mailListController/getAllMailLists");
const deleteMailList = require("../controllers/mailListController/deleteMailList");
const addEmailToList = require("../controllers/mailListController/addEmailToList");
const getEmailsFromList = require("../controllers/mailListController/getEmailsFromList");
const deleteEmailFromList = require("../controllers/mailListController/deleteEmailFromList");
const importEmailsBulk = require("../controllers/mailListController/importEmailsBulk");

// Listas de correo
router.post("/", createMailList);
router.get("/", getAllMailLists);
router.delete("/:id", deleteMailList);

// Emails dentro de una lista
router.post("/:id/emails", addEmailToList); // Agregar email a lista
router.post("/:id/emails/bulk", importEmailsBulk);
router.get("/:id/emails", getEmailsFromList); // Obtener emails de lista
router.delete("/:id/emails/:emailId", deleteEmailFromList); // Eliminar email de lista

module.exports = router;
