const { MailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MailList.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: "Lista no encontrada" });

    res.json({ message: "Lista eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la lista:", error);
    res.status(500).json({ error: "Error al eliminar la lista" });
  }
};
