const { EmailsMailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    console.log('datos que llegan', req.params);
    const { id, emailId } = req.params;

    const deleted = await EmailsMailList.destroy({
      where: {
        id: emailId,
        mail_list_id: id,
      },
    });

    if (!deleted) return res.status(404).json({ error: "Email no encontrado en la lista" });

    res.json({ message: "Email eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar email:", error);
    res.status(500).json({ error: "Error al eliminar email de la lista" });
  }
};
