const { stock, barangMasuk } = require("../model/bundleModel");
const { Op, NUMBER } = require("sequelize");
const moment = require("moment");

// create data stock
exports.create = async (req, res) => {
  const tanggal = moment(req.body.tanggal, "YYYY-MM-DD").format("YYYY-MM-DD");
  const data = {
    nama_barang: req.body.nama_barang,
    jenis_barang: req.body.jenis_barang,
    merk: req.body.merk,
    jumlah: req.body.jumlah,
    harga: req.body.harga,
    satuan: req.body.satuan,
  };

  const dataStock = await stock.findOne({
    where: {
      [Op.and]: [{ nama_barang: data.nama_barang }, { merk: data.merk }],
    },
  });

  if (dataStock !== null) {
    res.json(
      "Stock sudah ada, gunakan tombol Edit untuk merubah informasi stock!"
    );
    console.log(dataStock);
  } else {
    await stock.create(data).then(async (created) => {
      const insertBarangMasuk = {
        tanggal: tanggal,
        jumlah: data.jumlah,
        keterangan: req.body.keterangan,
        idStock: created.id_barang,
      };
      await barangMasuk.create(insertBarangMasuk);
      res.status(200).json({
        massage: "Insert data success",
        data: {
          stock: data,
          barangMasuk: insertBarangMasuk,
        },
      });
    });
  }
};

// get all data stock
exports.findAll = async (req, res) => {
  await stock.findAll().then((response) => res.status(200).json(response));
};

// get specific data stock
exports.findOne = async (req, res) => {
  const id = req.params.id;
  const specificStock = await stock.findOne({ where: { id_barang: id } });
  res.json(specificStock);
};

// search data stock
exports.search = async (req, res) => {
  const search = req.query.search_query || "";
  const jumlah = Number(req.body.jumlah) || null;
  await stock
    .findAll({
      where: {
        [Op.or]: [
          { nama_barang: { [Op.like]: `%${search}%` } },
          { jenis_barang: { [Op.like]: `%${search}%` } },
          { merk: { [Op.like]: `%${search}%` } },
          { jumlah: jumlah },
          { satuan: { [Op.like]: `%${search}%` } },
        ],
      },
    })
    .then((found) => {
      if (found) {
        res.json(found);
      } else {
        res.json("Data Not Found");
      }
    });
};

// update data stock
exports.update = async (req, res) => {
  const id = req.params.id;
  const data = {
    nama_barang: req.body.nama_barang,
    jenis_barang: req.body.jenis_barang,
    merk: req.body.merk,
    jumlah: req.body.jumlah,
    satuan: req.body.satuan,
  };
  await stock.update(data, { where: { id_barang: id } });
  res.json("Update data success");
};

// delete data stock
exports.delete = async (req, res) => {
  const id = req.params.id;
  await stock.destroy({ where: { id_barang: id } });
  res.json("Delete data success");
};
