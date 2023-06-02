module.exports = (sequelize, DataTypes) => {
  const barangKeluar = sequelize.define(
    "barangKeluar",
    {
      id_barangKeluar: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNULL:  false,
      },
      jumlah: {
        type: DataTypes.INTEGER,
        allowNULL: false,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
      },
      keterangan: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return barangKeluar;
};
