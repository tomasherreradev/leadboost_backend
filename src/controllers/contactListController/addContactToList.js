const { NumbersContactList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { number } = req.body;
    // Falta obtener el id de la lista
    const { id } = req.params;

    const nuevoContacto = await NumbersContactList.create({
      number,
      contact_list_id: id, // <-- Esto es lo importante
    });

    res.json(nuevoContacto);
  } catch (error) {
    console.error("Error al agregar contacto:", error);
    res.status(500).json({ error: "Error al agregar contacto" });
  }
};
