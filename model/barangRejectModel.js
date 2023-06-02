module.exports = (sequelize, DataTypes) => {
  const barangReject = sequelize.define(
    "barangreject",
    {
      idBarangReject: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      keterangan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );
  
  return barangReject
};
