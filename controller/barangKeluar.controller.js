const { barangKeluar, stock, sequelize } = require("../model/bundleModel");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const moment = require("moment");

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

// function for get data on stock table based on nama barnag and merk
const stockData = async (req, res) => {
  const data = await stock
    .findOne({
      where: {
        nama_barang: req.body.nama_barang,
        merk: req.body.merk,
      },
    })
    .then((res) => res);
  return data;
};

// create data
exports.create = async (req, res) => {
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD");
  const { id_barang, jumlah } = await stockData(req, res);
  if (id_barang !== null) {
    const create = {
      tanggal: tanggal,
      jumlah: req.body.jumlah,
      satuan: req.body.satuan,
      keterangan: req.body.keterangan,
      idStock: id_barang,
    };
    await barangKeluar.create(create).then(async (created) => {
      if (created) {
        await stock
          .update(
            {
              jumlah: jumlah - create.jumlah,
            },
            {
              where: {
                id_barang: id_barang,
              },
            }
          )
          .then((updated) => {
            if (updated) {
              console.log("update stock data success");
            } else {
              console.log("update stock data error");
            }
          });
        res.status(200).json({
          massage: "data created",
          data: create,
        });
      } else {
        res.status(400).json("create data error");
      }
    });
  } else {
    console.log("stock data not found");
  }
};

// get all data
exports.findAll = async (req, res) => {
  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangkeluar.jumlah, tanggal, keterangan 
                FROM barangkeluar LEFT OUTER JOIN stock ON barangkeluar.idStock = stock.id_barang 
                ORDER BY tanggal ASC`
  await sequelize.query(
    query, 
    {
      type: QueryTypes.SELECT
    }
  )
  .then(data => {
    if (data) {
      res.status(200).json(data)
    } else {
      res.status(400).json("data not found")      
    }
  });
};

// searching function
exports.search = async (req, res) => {
  const search = req.query.search || "";
  const jumlah = Number(search) || null;
  const startDate = formatDate(req.query.startDate);
  const endDate = formatDate(req.query.endDate);
  const tanggal = formatDate(req.query.tanggal);

  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangkeluar.jumlah, tanggal, keterangan 
                FROM barangkeluar LEFT OUTER JOIN stock ON barangkeluar.idStock = stock.id_barang 
                WHERE stock.nama_barang LIKE '%${search}%' OR stock.merk LIKE '%${search}%' 
                OR satuan LIKE '%${search}%' OR tanggal= :tanggal OR tanggal BETWEEN :startDate AND :endDate OR 
                barangkeluar.jumlah= :jumlah OR keterangan LIKE '%${search}%' ORDER BY tanggal ASC`;
  await sequelize
    .query(
      query,
      {
        replacements: {
          tanggal: tanggal,
          startDate: startDate,
          endDate: endDate,
          jumlah: jumlah,
        },
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(400).json("data not found");
      }
    })
    .catch((err) => res.json(err));
};

// update data
exports.update = async (req, res) => {
  const id = req.params.id
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD")
  const update = {
    jumlah: req.body.jumlah,
    tanggal: tanggal,
    keterangan: req.body.keterangan
  }
  const { idStock, jumlah: jumlahBarangKeluar} = await barangKeluar.findOne({
    where: {
      id_barangKeluar: id
    }
  }).then(data => data?data:{})

  if (jumlahBarangKeluar !== null) {
    let {jumlah: jumlahStock} = await stock.findOne({
      where: {
        id_barang: idStock
      }
    }).then(data => data?data:{})
    
    if (update.jumlah === jumlahBarangKeluar) {
      jumlahStock = jumlahStock
    } else if (update.jumlah > jumlahBarangKeluar) {
      jumlahStock -= (update.jumlah - jumlahBarangKeluar)
    } else if (update.jumlah < jumlahBarangKeluar) {
      jumlahStock += (jumlahBarangKeluar - update.jumlah)
    }
    await barangKeluar.update(update, {
      where: {
        id_barangKeluar: id
      }
    }).then(async updated => {
        await stock.update({
          jumlah: jumlahStock
        }, {
          where: {
            id_barang: idStock
          }
        }).then(updated => {
          console.log("update stock success")
        }).catch(err => {
          console.log(err)
        })
        res.status(200).json("update data succes")
      }).catch(err => {
        res.status(400).json(err)
      })
  } else {
    console.log("data barangKeluar not found")
  }
};

// delete data
exports.delete = async (req, res) => {
  // if data barang keluar was deleted, jumlah stock + jumlah barang keluar
  // need: stock id, jumlah stock, barang keluar id, jumlah barang keluar 
  const id = req.params.id
  const {idStock, jumlah: jumlahBarangKeluar} = await barangKeluar.findOne({
    where: {
      id_barangKeluar: id
    }
  }).then(data => data?data:{})

  if (idStock !== null) {
    await barangKeluar.destroy({
      where: {
        id_barangKeluar: id
      }
    }).then(async deleted => {
      const {jumlah: jumlahStock} = await stock.findOne({
        where: {
          id_barang: idStock
        }
      }).then(data => data?data:{})
  
      if (jumlahStock !== null) {
        await stock.update({
          jumlah: jumlahStock + jumlahBarangKeluar
        }, {
          where: {
            id_barang: idStock
          }
        }).then(updated => {
          console.log("update stock success")
        }).catch(err => {
          console.log(err)
        })
      } else {
        console.log("data stock not found")
      }

      res.status(200).json("delete data success")

    }).catch(err => {
      res.status(400).json("delete data error")
      console.log(err)
    })
  } else {
    console.log("data barang keluar not found")
  }
};
