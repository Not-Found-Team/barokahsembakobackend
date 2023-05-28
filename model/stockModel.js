module.exports = (sequelize, DataTypes) => {
    const stock = sequelize.define('stock', {
        id_barang: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_barang: {
            type: DataTypes.STRING,
            allwoNULL: false
        },
        jenis_barang: {
            type: DataTypes.STRING,
            allowNULL: false
        },
        merk: {
            type: DataTypes.STRING,
            allowNULL: false
        },
        harga: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },
        satuan: {
            type: DataTypes.STRING,
            allowNULL: false
        }
    },
    {
        freezeTableName:true
    })

    return stock
}