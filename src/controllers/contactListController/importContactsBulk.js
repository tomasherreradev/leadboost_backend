const { NumbersContactList } = require("../../../models");

module.exports = async (req, res) => {
  const { id } = req.params;
  const { contacts } = req.body;

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: "Se esperaba un array de contacts" });
  }

  const datos = contacts
    .filter(contact => typeof contact === "string" && contact.trim() !== "")
    .map(contact => ({
      contact: contact.trim(),
      contact_list_id: id,
    }));

  try {
    const inserted = await NumbersContactList.bulkCreate(datos);
    res.json({ inserted });
  } catch (error) {
    console.error("Error al importar contacts en lote:", error);
    res.status(500).json({ error: "Error al importar contacts" });
  }
};
