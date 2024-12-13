const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, body, role } = req.body;

    try {
      const employeeTokens = [];
      const querySnapshot = await db
        .collection("users")
        .where("role", "==", role)
        .get();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          employeeTokens.push(data.token);
        }
      });

      if (employeeTokens.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay usuarios a los que enviar un mensaje" });
      }

      const message = {
        notification: {
          title: title,
          body: body,
        },
        tokens: employeeTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.status(200).json({ successCount: response.successCount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
