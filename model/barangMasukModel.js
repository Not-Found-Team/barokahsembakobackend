module.exports = (sequelize, DataTypes) => {
    const barangMasuk = sequelize.define("barangMasuk", {
        id_barangMasuk: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNUll: false
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },
        tanggal: {
            type: DataTypes.DATEONLY,
        },
        keterangan: {
            type: DataTypes.STRING
        }
    }, 
    {
        freezeTableName:true
    })

    return barangMasuk
}