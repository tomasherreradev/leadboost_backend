const { EmailsMailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { id } = req.params; // mail_list_id
    const { email } = req.body;

    const nuevoEmail = await EmailsMailList.create({
      email,
      mail_list_id: id,
    });

    res.status(201).json(nuevoEmail);
  } catch (error) {
    console.error("Error al agregar email:", error);
    res.status(500).json({ error: "Error al agregar email a la lista" });
  }
};
