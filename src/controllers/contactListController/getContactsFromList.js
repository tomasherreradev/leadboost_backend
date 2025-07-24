const { NumbersContactList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const contacts = await NumbersContactList.findAll({
      where: { contact_list_id: id },
    });

    res.json(contacts);
  } catch (error) {
    console.error("Error al obtener contacts:", error);
    res.status(500).json({ error: "Error al obtener contacts de la lista" });
  }
};
