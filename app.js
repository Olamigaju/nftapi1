const express = require("express");

const cors = require("cors");

const nftRouter = require("./Api/Routers/nftRouter");

const userRouter = require("./Api/Routers/userRouter");

//MIDDLEWAE

const app = express();
app.use(express.json({ limit: "100kkb" }));

app.use(cors());
app.options("*", cors());

//Routes

app.use("/api/v1/NFTS", nftRouter);
app.use("/api/v1/user", userRouter);

module.exports = app;
