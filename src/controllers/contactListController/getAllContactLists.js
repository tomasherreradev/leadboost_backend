const { ContactList, NumbersContactList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const listas = await ContactList.findAll({
      include: [{ model: NumbersContactList, as: "numbers" }],
    });

    res.json(listas);
  } catch (error) {
    console.error("Error al obtener listas:", error);
    res.status(500).json({ error: "Error al obtener las listas de contactos" });
  }
};
