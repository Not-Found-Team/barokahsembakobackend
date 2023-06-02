const {Sequelize, DataTypes} = require('sequelize')
const dbConfig = require('../config/dbConfig')

const sequelize = new Sequelize(
    dbConfig.DATABASE,
    dbConfig.USERNAME,
    dbConfig.PASSWORD, {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect
    }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.stock = require('./stockModel')(sequelize, DataTypes)
db.barangMasuk = require('./barangMasukModel')(sequelize, DataTypes)
db.barangKeluar = require('./barangKeluarModel')(sequelize, DataTypes)
db.users = require('./usersModel')(sequelize, DataTypes)
db.barangReject = require('./barangRejectModel')(sequelize, DataTypes)

// association
db.stock.hasMany(db.barangMasuk, {
    foreignKey: 'idStock',
    onDelete: 'CASCADE'
})
db.stock.hasMany(db.barangKeluar, {
    foreignKey: 'idStock',
    onDelete: 'CASCADE'
})
db.barangMasuk.belongsTo(db.stock, {
    foreignKey: 'idStock',
    as: 'Stock',
    onDelete: 'CASCADE'
})
db.barangKeluar.belongsTo(db.stock, {
    foreignKey: 'idStock',
    as: 'Stock',
    onDelete: 'CASCADE'
})

db.barangMasuk.hasOne(db.barangReject, {
    foreignKey: 'idBarangMasuk',
    onDelete: 'CASCADE',
})
db.barangReject.belongsTo(db.barangMasuk, {
    foreignKey: "idBarangMasuk",
    as: 'barangmasuk',
})

module.exports = db 