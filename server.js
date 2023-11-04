const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const { createSuperAdminIfNotExists } = require("./createSuperAdmin");

const port = process.env.PORT || 5002;

createSuperAdminIfNotExists();


//middleware
app.use(express.json());
app.use(cookieParser());
//routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/adminRoutes"));
app.use("/api", require("./routes/userRoutes"))


app.listen(port, () => console.log(`app listening on port ${port}`));
