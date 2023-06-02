const { barangReject, stock, barangMasuk } = require("../model/bundleModel");
const { Op, QueryTypes } = require("sequelize");

const findOne = async (req, res, id) => {
  const datareject = await barangReject
    .findOne({
      where: {
        idBarangReject: id,
      },
      include: {
        model: barangMasuk,
        as: "barangmasuk",
        require: false,
        include: {
          model: stock,
          as: "Stock",
          require: false,
        },
      },
    })
    .then((response) => (response ? response : {}));

  return datareject;
};

exports.findAll = async (req, res) => {
  await barangReject
    .findAll({
      include: {
        model: barangMasuk,
        as: "barangmasuk",
        require: false,
        include: {
          model: stock,
          as: "Stock",
          require: false,
        },
      },
    })
    .then((response) => res.status(200).json(response));
};

exports.search = async (req, res) => {
  const search = req.query.search || "";
  const jumlah = Number(req.body.jumlah) || null;

  await barangReject
    .findAll({
      where: {
        [Op.or]: [
          {
            jumlah: jumlah,
          },
          {
            keterangan: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$barangmasuk.Stock.nama_barang$": {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$barangmasuk.Stock.merk$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      include: [
        {
          model: barangMasuk,
          as: "barangmasuk",
          required: false,
          include: [
            {
              model: stock,
              as: "Stock",
              require: false,
            },
          ],
        },
      ],
    })
    .then((response) => res.status(200).json(response))
    .catch((err) => res.json(err));
};

exports.update = async (req, res) => {
  const id = req.params.id;
  let jumlah = 0;
  const {
    jumlah: jumlahBarangReject,
    barangmasuk: {
      Stock: { id_barang, jumlah: jumlahStock },
    },
  } = await findOne(req, res, id);

  const data = {
    jumlah: req.body.jumlah,
    keterangan: req.body.keterangan,
  };

  await barangReject
    .update(data, {
      where: {
        idBarangReject: id,
      },
    })
    .then(async (response) => {
      if (data.jumlah > jumlahBarangReject) {
        jumlah = jumlahStock - (data.jumlah - jumlahBarangReject);
      } else if (data.jumlah < jumlahBarangReject) {
        jumlah = jumlahStock + (jumlahBarangReject - data.jumlah);
      }

      await stock
        .update(
          {
            jumlah: jumlah,
          },
          {
            where: {
              id_barang: id_barang,
            },
          }
        )
        .then((res) => console.log("update stock success"))
        .catch((err) => console.log(err));

      res.status(200).json("update data success");
    })
    .catch((err) => res.json(err));
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const {
    jumlah: jumlahBarangReject,
    barangmasuk: {
      Stock: { id_barang, jumlah: jumlahStock },
    },
  } = await findOne(req, res, id);

  await barangReject
    .destroy({
      where: {
        idBarangReject: id,
      },
    })
    .then(async (response) => {
      await stock
        .update(
          {
            jumlah: jumlahStock + jumlahBarangReject,
          },
          {
            where: {
              id_barang: id_barang,
            },
          }
        )
        .then((response) => console.log("update stock success"))
        .catch((err) => console.log(err));

      res.status(200).json("delete data success");
    })
    .catch((err) => res.json(err));
};
