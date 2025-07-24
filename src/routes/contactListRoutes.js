const express = require("express");
const router = express.Router();

const createContactList = require("../controllers/contactListController/createContactList");
const getAllContactLists = require("../controllers/contactListController/getAllContactLists");
const deleteContactList = require("../controllers/contactListController/deleteContactList");
const addContactToList = require("../controllers/contactListController/addContactToList");
const getContactsFromList = require("../controllers/contactListController/getContactsFromList");
const deleteContactFromList = require("../controllers/contactListController/deleteContactFromList");
const importContactsBulk = require("../controllers/contactListController/importContactsBulk");

// Listas de contactos
router.post("/", createContactList);
router.get("/", getAllContactLists);
router.delete("/:id", deleteContactList);

// Contacts dentro de una lista
router.post("/:id/contacts", addContactToList); // Agregar contacto a lista
router.post("/:id/contacts/bulk", importContactsBulk);
router.get("/:id/contacts", getContactsFromList); // Obtener contacts de lista
router.delete("/:id/contacts/:contactId", deleteContactFromList); // Eliminar contacto de lista

module.exports = router;
