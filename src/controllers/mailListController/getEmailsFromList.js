const { EmailsMailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const emails = await EmailsMailList.findAll({
      where: { mail_list_id: id },
    });

    res.json(emails);
  } catch (error) {
    console.error("Error al obtener emails:", error);
    res.status(500).json({ error: "Error al obtener emails de la lista" });
  }
};
