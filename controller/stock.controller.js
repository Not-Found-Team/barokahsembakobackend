const { stock, barangMasuk } = require("../model/bundleModel");
const { Op } = require('sequelize')


// create data stock
exports.create = async (req, res) => {
  const data = {
    nama_barang: req.body.nama_barang,
    jenis_barang: req.body.jenis_barang,
    merk: req.body.merk,
    jumlah: req.body.jumlah,
    harga: req.body.harga,
    satuan: req.body.satuan
  }

  await stock.findOne({
    where: {
      [Op.and]: [
        {nama_barang: data.nama_barang},
        {merk: data.merk},
      ] 
    }
  })
  .then(async dataStock => {
    if (dataStock !== null) {
      res.json("Stock already added")
    } else {
      await stock.create(data)
      .then(async created => {
        if (created) {
          const idStock = await stock.findOne({
            where: {
              nama_barang: data.nama_barang
            }
          })
          if (idStock !== null) {
            const insertBarangMasuk = {
              tanggal: req.body.tanggal,
              jumlah: data.jumlah,
              keterangan: req.body.keterangan,
              idStock: idStock.id_barang
            }
            await barangMasuk.create(insertBarangMasuk)
            res.status(200).json({
              massage: "Insert data success",
              data: {
                stock: data,
                barangMasuk: insertBarangMasuk
              }
            })
          } else {
            res.status(400).json("Insert data error, stock not found")
          }
        } else {
          res.status(400).json("Insert data error")
        }
      })
      
    }

  })
  
};

// get all data stock
exports.findAll = async (req, res) => {
  await stock.findAll()
  res.status(200).json(allStock)
};

// get specific data stock
exports.findOne = async (req, res) => {
  const id = req.params.id
  const specificStock = await stock.findOne({ where: {id_barang: id} })
  res.json(specificStock)
}

// search data stock
exports.findAll = async (req, res) => {
  const search = req.query.search_query || ""
  await stock.findAll({
    where: {
      [Op.or]: [
        {nama_barang: {[Op.like]: `%${search}%`}},
        {jenis_barang: {[Op.like]: `%${search}%`}},
        {merk: {[Op.like]: `%${search}%`}},
        {jumlah: {[Op.like]: `%${search}%`}},
        {satuan: {[Op.like]: `%${search}%`}},
      ]
    }
  })
  .then(found => {
    if (found) {
      res.json(found)
    } else {
      res.json("Data Not Found")
    }
  })
}

// update data stock
exports.update = async (req, res) => {
  const id = req.params.id
  const data = {
    nama_barang: req.body.nama_barang,
    jenis_barang: req.body.jenis_barang,
    merk: req.body.merk,
    jumlah: req.body.jumlah,
    satuan: req.body.satuan,
  }
  await stock.update(data, { where: {id_barang: id} })
  res.json("Update data success")
}

// delete data stock
exports.delete = async (req, res) => {
  const id = req.params.id 
  await stock.destroy({ where: {id_barang: id} })
  res.json("Delete data success")
}