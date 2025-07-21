const { MailList, EmailsMailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const listas = await MailList.findAll({
      include: [{ model: EmailsMailList, as: "emails" }],
    });

    res.json(listas);
  } catch (error) {
    console.error("Error al obtener listas:", error);
    res.status(500).json({ error: "Error al obtener las listas de correo" });
  }
};
