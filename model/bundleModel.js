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

// association
db.stock.hasMany(db.barangMasuk, {
    foreignKey: 'idStock',
    onDelete: 'NO ACTION'
})
db.stock.hasMany(db.barangKeluar, {
    foreignKey: 'idStock',
    onDelete: 'NO ACTION'
})
db.barangMasuk.belongsTo(db.stock, {
    foreignKey: 'idStock',
    as: 'Stock',
    onDelete: 'NO ACTION'
})
db.barangKeluar.belongsTo(db.stock, {
    foreignKey: 'idStock',
    as: 'Stock',
    onDelete: 'NO ACTION'
})

module.exports = db