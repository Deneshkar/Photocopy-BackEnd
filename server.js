const dotenv = require("dotenv");
const connectDB = require("./config/db");
const createApp = require("./app");

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
