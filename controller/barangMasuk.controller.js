const { barangMasuk, stock, barangReject } = require("../model/bundleModel");
const { Op } = require("sequelize");
const moment = require("moment");

const findStock = async (req, res) => {
  const stockData = await stock
    .findOne({
      where: {
        nama_barang: req.body.nama_barang,
        merk: req.body.merk,
      },
    })
    .then((res) => res);
  return stockData;
};

exports.create = async (req, res) => {
  const idStock = await findStock(req, res);
  let jumlah = 0
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD");
  const create = {
    tanggal: tanggal,
    jumlah: req.body.jumlahBarangMasuk,
    keterangan: req.body.keterangan,
    idStock: idStock.id_barang,
  };
  if (idStock !== null) {
    // create data barang masuk
    await barangMasuk
      .create(create)
      .then(async (created) => {
        const dataBarangReject = {
          jumlah: req.body.jumlahBarangReject || null,
          keterangan: req.body.keteranganReject || null,
          idBarangMasuk: created.id_barangMasuk,
        };

        jumlah = dataBarangReject.jumlah

        if (jumlah !== null) {
          // create data barang reject
          await barangReject.create(dataBarangReject);
          jumlah = idStock.jumlah + (create.jumlah - dataBarangReject.jumlah) 
        } else if (jumlah === null) {
          jumlah = idStock.jumlah + create.jumlah
        }

        // update jumlah on stock table
        await stock.update(
          {
            jumlah: jumlah
          },
          { where: { id_barang: create.idStock } }
        );
        res.status(200).json({
          massage: "Insert data success",
          data: created,
        });
      })
      .catch((err) => {
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
  const allData = await barangMasuk.findAll({
    include: {
      model: stock,
      as: "Stock",
      required: false,
    },
  });
  res.status(200).json(allData);
};

// find all data for searching data barang masuk
exports.search = async (req, res) => {
  const search = req.query.search || "";
  const jumlah = Number(search) || null;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  await barangMasuk
    .findAll({
      where: {
        [Op.or]: [
          // {
          //   tanggal: {
          //     [Op.like]: Sequelize.literal(`"%${tanggal}%"`),
          //   },
          // },
          {
            tanggal: {
              [Op.between]: [startDate, endDate],
            },
          },
          // Sequelize.literal(`tanggal LIKE "%${tanggal}%"`),
          // Sequelize.literal(`tanggal BETWEEN "${startDate}" AND "${endDate}"`),
          {
            jumlah: jumlah,
          },
          {
            "$Stock.nama_barang$": {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$Stock.merk$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      include: [
        {
          model: stock,
          as: "Stock",
          required: false,
        },
      ],
    })
    .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(400).json("data not found");
      }
    });
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
  let { id_barang, jumlah: jumlahStock } = await findStock(req, res);
  const updateData = {
    tanggal: tanggal,
    jumlah: req.body.jumlah,
    keterangan: req.body.keterangan,
    idStock: id_barang,
  };
  const { jumlah } = await barangMasuk
    .findOne({ where: { id_barangMasuk: id } })
    .then((res) => (res ? res : {}));
  await barangMasuk
    .update(updateData, { where: { id_barangMasuk: id } })
    .then(async (updated) => {
      if (updated) {
        if (jumlah !== null) {
          if (updateData.jumlah === jumlah) {
            jumlahStock = jumlahStock;
          } else if (updateData.jumlah < jumlah) {
            jumlahStock -= jumlah - updateData.jumlah;
          } else if (updateData.jumlah > jumlah) {
            jumlahStock += updateData.jumlah - jumlah;
          }
          await stock
            .update(
              { jumlah: jumlahStock },
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
  await barangMasuk
    .destroy({ where: { id_barangMasuk: id } })
    .then(async (deleted) => {
      if (deleted) {
        await stock.update(
          { jumlah: jumlahStock - (jumlahBarangMasuk - jumlahReject) },
          { where: { id_barang: idStock } }
        );
        res.status(200).json("delete data success");
      } else {
        res.status(400).json("delete data error");
      }
    });
};
