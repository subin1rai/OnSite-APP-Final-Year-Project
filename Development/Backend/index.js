const express = require("express");
const http = require("http");
const routes = require("./routes/routes");
const { initializeSocket } = require('./controllers/socketController');
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api", routes);

const server = http.createServer(app);
initializeSocket(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});