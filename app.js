const express = require("express");
const path = require('path');

const indexRouter = require("./routes/index");
const orderRouter = require("./routes/order");
const stokRouter = require("./routes/stok");
const kampanyaRouter = require("./routes/kampanya");



const port = 3001;
const app = new express();
const server = require('http').Server(app);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'views')));


app.use('/', indexRouter);
app.use("/order", orderRouter);
app.use("/kampanya", kampanyaRouter);
app.use("/stok", stokRouter);

server.listen(port, () => console.log(`Port is running on port ${port}`));