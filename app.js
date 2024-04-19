require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const yaml = require("yaml");
const swaggerUI = require("swagger-ui-express");
const fs = require("fs");
const file = fs.readFileSync("./oas.yaml", "utf-8");
const swaggerDocument = yaml.parse(file);

const { PORT = 3000 } = process.env;
const v1 = require("./routes/v1/index");

app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use("/oas", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1", v1);

app.use((err, req, res, next) => {
    res.status(500).json({ err: err.message });
});

app.use((req, res, next) => {
    res.status(404).json({ err: `Cannot ${req.method} ${req.url}` });
});

// app.listen(PORT, () => {
//     console.log(`running on port ${PORT}`);
// });

module.exports = app;