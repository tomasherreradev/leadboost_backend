const { MailList } = require("../../../models");

module.exports = async (req, res) => {
  try {
    const { nombre, observacion, user_id } = req.body;

    const nuevaLista = await MailList.create({
      nombre,
      observacion,
      user_id,
    });

    res.status(201).json(nuevaLista);
  } catch (error) {
    console.error("Error al crear la lista:", error);
    res.status(500).json({ error: "Error al crear la lista de correo" });
  }
};
