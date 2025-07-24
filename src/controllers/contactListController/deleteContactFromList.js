const { NumbersContactList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    // console.log('datos que llegan', req.params);
    const { id, contactId } = req.params;

    const deleted = await NumbersContactList.destroy({
      where: {
        id: contactId,
        contact_list_id: id,
      },
    });

    if (!deleted) return res.status(404).json({ error: "Contacto no encontrado en la lista" });

    res.json({ message: "Contacto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar contacto:", error);
    res.status(500).json({ error: "Error al eliminar contacto de la lista" });
  }
};
