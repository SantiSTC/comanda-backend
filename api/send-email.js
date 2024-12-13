const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { aceptacion, nombreUsuario, mail } = req.body;

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL,
          pass: process.env.PASSWORD,
        },
      });

      const resultado = await transporter.sendMail({
        from: '"Mi Comanda" <restopscomanda@gmail.com>',
        to: mail,
        subject: aceptacion
          ? "Felicitaciones su cuenta fue aceptada"
          : "Disculpe pero hemos bloqueado su cuenta",
        html: `
          <h1>${aceptacion ? "Felicitaciones " : "Disculpe "} ${nombreUsuario}</h1>
          <p>Su cuenta fue ${aceptacion ? "aceptada" : "rechazada"}</p>
          <p>Saludos La Comanda</p>
        `,
      });

      res.status(200).json({ ...resultado, seEnvio: true });
    } catch (e) {
      res.status(500).json({
        mensaje: "No se pudo enviar el mail",
        seEnvio: false,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
