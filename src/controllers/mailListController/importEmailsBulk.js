const { EmailsMailList } = require("../../../models");

module.exports = async (req, res) => {
  const { id } = req.params;
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: "Se esperaba un array de emails" });
  }

  const datos = emails
    .filter(email => typeof email === "string" && email.trim() !== "")
    .map(email => ({
      email: email.trim(),
      mail_list_id: id,
    }));

  try {
    const inserted = await EmailsMailList.bulkCreate(datos);
    res.json({ inserted });
  } catch (error) {
    console.error("Error al importar emails en lote:", error);
    res.status(500).json({ error: "Error al importar emails" });
  }
};
