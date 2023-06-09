const { barangReject, stock, barangMasuk, sequelize } = require("../model/bundleModel");
const { Op, QueryTypes } = require("sequelize");

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

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
  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangreject.jumlah, barangmasuk.tanggal, barangreject.keterangan 
                FROM barangreject LEFT OUTER JOIN barangmasuk ON barangreject.idBarangMasuk = barangmasuk.id_barangMasuk 
                LEFT OUTER JOIN stock ON barangmasuk.idStock = stock.id_barang ORDER BY tanggal ASC `
  await sequelize.query(
    query,
    {
      type: QueryTypes.SELECT
    }
  ) // test
    .then((response) => res.status(200).json(response))
    .catch(err => res.json(err));
};

exports.search = async (req, res) => {
  const search = req.query.search || "";
  const jumlah = Number(search) || null;
  const startDate = formatDate(req.query.startDate);
  const endDate = formatDate(req.query.endDate);
  const tanggal = formatDate(req.query.tanggal);

  const query = `SELECT stock.nama_barang, stock.merk, stock.satuan, barangreject.jumlah, barangmasuk.tanggal, barangreject.keterangan 
                FROM barangreject LEFT OUTER JOIN barangmasuk ON barangreject.idBarangMasuk = barangmasuk.id_barangMasuk 
                LEFT OUTER JOIN stock ON barangmasuk.idStock = stock.id_barang where nama_barang LIKE '%${search}%' OR merk LIKE '%${search}%' 
                OR satuan LIKE '%${search}%' OR barangreject.jumlah= :jumlah OR tanggal= :tanggal OR tanggal BETWEEN :startDate AND :endDate 
                OR barangreject.keterangan LIKE '%${search}%' ORDER BY tanggal ASC`;
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
