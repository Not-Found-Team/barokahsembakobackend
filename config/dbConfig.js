require('dotenv').config();
const { Uri } = require('../Uri');

module.exports = {
    HOST: Uri.rootUri,
    USERNAME: Uri.dbUsername,
    PASSWORD: Uri.dbPassword,
    DATABASE: Uri.dbName,
    dialect: Uri.dbDialect
}