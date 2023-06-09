const {
  barangMasuk,
  stock,
  barangReject,
  sequelize,
} = require("../model/bundleModel");
const { Op, Sequelize, QueryTypes } = require("sequelize");
const moment = require("moment");

const findStock = async (req, res) => {
  const stockData = await stock.findOne({
    where: {
      [Op.and]: [
        { nama_barang: req.body.nama_barang },
        { merk: req.body.merk },
      ],
    },
  });
  return stockData;
};

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

exports.create = async (req, res) => {
  const idStock = await findStock(req, res);
  console.log(typeof idStock.jumlah);
  let jumlah = 0;
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD");
  const create = {
    tanggal: tanggal,
    jumlah: Number(req.body.jumlahBarangMasuk),
    keterangan: req.body.keterangan,
    idStock: idStock.id_barang,
  };
  console;
  if (idStock !== null) {
    // create data barang masuk
    await barangMasuk
      .create(create)
      .then(async (created) => {
        const dataBarangReject = {
          jumlah: Number(req.body.jumlahBarangReject) || null,
          keterangan: req.body.keteranganReject || null,
          idBarangMasuk: created.id_barangMasuk,
        };

        jumlah = dataBarangReject.jumlah;

        if (jumlah !== null) {
          // create data barang reject
          await barangReject.create(dataBarangReject);
          jumlah = idStock.jumlah + (create.jumlah - dataBarangReject.jumlah);
        } else if (jumlah === null) {
          jumlah = idStock.jumlah + create.jumlah;
        }
        console.log(idStock.jumlah, jumlah);

        // update jumlah on stock table
        await stock.update(
          {
            jumlah: jumlah,
          },
          { where: { id_barang: create.idStock } }
        );
        console.log(created);
        res.status(200).json({
          massage: "Insert data success",
          data: created,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ massage: err });
      });
  } else {
    res
      .status(400)
      .json(`Tidak ada barang dengan nama ${req.body.nama_barang}`);
  }
};

// find all data for table barang masuk
exports.findAll = async (req, res) => {
  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangmasuk.id_barangMasuk, barangmasuk.jumlah AS jumlahBarangMasuk, tanggal, keterangan 
                FROM barangmasuk LEFT OUTER JOIN stock ON barangmasuk.idStock = stock.id_barang 
                ORDER BY tanggal ASC`;
  await sequelize
    .query(query, {
      type: QueryTypes.SELECT,
    })
    .then((response) => {
      res.json(response);
    });
};

// find all data for searching data barang masuk
exports.search = async (req, res) => {
  const search = req.query.search || "";
  const jumlah = Number(search) || null;
  const startDate = formatDate(req.query.startDate);
  const endDate = formatDate(req.query.endDate);
  const tanggal = formatDate(req.query.tanggal);

  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangmasuk.id_barangMasuk, barangmasuk.jumlah, tanggal, keterangan 
                FROM barangmasuk LEFT OUTER JOIN stock ON barangmasuk.idStock = stock.id_barang 
                WHERE stock.nama_barang LIKE '%${search}%' OR stock.merk LIKE '%${search}%' OR 
                stock.satuan LIKE '%${search}%' OR tanggal= :tanggal OR tanggal BETWEEN :startDate AND :endDate OR 
                barangmasuk.jumlah= :jumlah OR keterangan LIKE '%${search}%' ORDER BY tanggal ASC`;
  await sequelize
    .query(query, {
      replacements: {
        tanggal: tanggal,
        startDate: startDate,
        endDate: endDate,
        jumlah: jumlah,
      },
      type: QueryTypes.SELECT,
    })
    .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(400).json("data not found");
      }
    })
    .catch((err) => res.json(err));
};

// exports.findOne = async (req, res) => {
//   const id = req.params.id;
//   const specificData = await barangMasuk
//     .findOne({
//       where: { id_barangMasuk: id },
//     })
//     .then((res) => res);
//   return {
//     specificData: specificData,
//     res: res.status(200).json(specificData),
//   };
// };

exports.update = async (req, res) => {
  const id = req.params.id;
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD");
  let jumlahReject = 0;
  let { id_barang } = await findStock(req, res);
  const {
    jumlah,
    Stock: { id_barang: prevStockId, jumlah: prevJumlahStock },
  } = await barangMasuk
    .findOne({
      where: { id_barangMasuk: id },
      include: {
        model: stock,
        as: "Stock",
      },
    })
    .then((res) => (res ? res : {}));
  const reject = await barangReject.findOne({
    where: {
      idBarangMasuk: id,
    },
  });
  const updateData = {
    tanggal: tanggal,
    jumlah: Number(req.body.jumlahBarangMasuk),
    keterangan: req.body.keterangan,
    idStock: id_barang,
  };

  await barangMasuk
    .update(updateData, { where: { id_barangMasuk: id } })
    .then(async (updated) => {
      if (updated) {
        let {jumlah: jumlahNewStock} = await findStock(req, res)
        
        if (id_barang === prevStockId) {
          if (jumlah !== null) {
            if (updateData.jumlah === jumlah) {
              console.log("1")
              jumlahNewStock = jumlahNewStock;
            } else if (updateData.jumlah < jumlah) {
              console.log("2")
              jumlahNewStock -= jumlah - updateData.jumlah;
            } else if (updateData.jumlah > jumlah) {
              console.log("3")
              jumlahNewStock += updateData.jumlah - jumlah;
            }

            await stock
              .update(
                { jumlah: jumlahNewStock },
                { where: { id_barang: id_barang } }
              )
              .then((updated) => {
                if (updated) {
                  console.log("update stock succes");
                } else {
                  console.log("update stock error");
                }
              });
          } else {
            console.log("jumlah stock data not found");
          }
        } else {
          console.log(jumlahNewStock)
          if (reject === null) {
            jumlahReject = 0;
          } else {
            jumlahReject = reject.jumlah;
          }

          await stock.update({
            jumlah: jumlahNewStock + (updateData.jumlah - jumlahReject)
          }, {
            where: {
              id_barang: id_barang
            }
          })
          .then(async u => {
            console.log("new stock updated")
            await stock.update(
              {
                jumlah: prevJumlahStock - (jumlah - jumlahReject),
              },
              {
                where: {
                  id_barang: prevStockId,
                },
              }
            ).then(u => {
              console.log("prev stock updated")
            });
          })

        }

        res.status(200).json("update data success");
      } else {
        res.status(400).json("update data error");
      }
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const { idStock, jumlah: jumlahBarangMasuk } = await barangMasuk
    .findOne({
      where: { id_barangMasuk: id },
    })
    .then((res) => (res ? res : {}));
  const { jumlah: jumlahStock } = await stock
    .findOne({
      where: { id_barang: idStock },
    })
    .then((res) => (res ? res : {}));
  const { jumlah: jumlahReject } = await barangReject
    .findOne({
      where: {
        idBarangMasuk: id,
      },
    })
    .then((res) => (res ? res : {}));

    console.log(idStock, jumlahBarangMasuk, jumlahStock, jumlahReject)
    
    await barangMasuk
    .destroy({ where: { id_barangMasuk: id } })
    .then(async (deleted) => {
      if (deleted) {
        let reject = 0

        if (jumlahReject === undefined) {
          reject = 0
        } else {
          reject = jumlahReject
        }
        console.log(idStock, jumlahBarangMasuk, jumlahStock, reject)
        await stock.update(
          { jumlah: jumlahStock - (jumlahBarangMasuk - reject) },
          { where: { id_barang: idStock } }
        );
        res.status(200).json("delete data success");
      } else {
        res.status(400).json("delete data error");
      }
    });
};
