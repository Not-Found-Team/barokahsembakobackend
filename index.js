const express = require("express");
const cors = require("cors");
const stockRouter = require("./router/stock");
const barangMasukRouter = require('./router/barangMasuk')
const barangKeluarRouter = require('./router/barangKeluar')
const usersRouter = require('./router/user')
const db = require("./model/bundleModel");

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// --- routers ---
// stock router
app.use('/stock', stockRouter);

// barang masuk router
app.use('/barangmasuk', barangMasukRouter)

// barang keluar router
app.use('/barangkeluar', barangKeluarRouter)

// users router
app.use('/login', usersRouter)

// sequelize sync
db.sequelize.sync({ force: false });

// run server
app.listen(port, () => {
  console.log(`server running on port:${port}`);
});
