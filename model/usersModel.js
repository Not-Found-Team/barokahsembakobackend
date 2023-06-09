module.exports = (sequelize, DataType) => {
    const users = sequelize.define('users', {
        id_users: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNULL: false
        },
        username: {
            type: DataType.STRING,
            allowNULL: false,
        },
        password: {
            type: DataType.STRING,
            allowNULL: false
        },
        role: {
            type: DataType.STRING
        }
    });

    return users
}