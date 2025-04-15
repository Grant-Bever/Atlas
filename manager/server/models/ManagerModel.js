const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Manager.hasMany(models.Timesheet, { foreignKey: 'manager_id', as: 'timesheets' });
      Manager.hasMany(models.Inventory, { foreignKey: 'manager_id', as: 'inventoryItems' });
    }
  }
  Manager.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
      // Consider adding hooks for password hashing (bcrypt) before saving
    }
  }, {
    sequelize,
    modelName: 'Manager',
    tableName: 'managers', // Explicitly set table name to lowercase plural
    timestamps: false // Assuming you don't have createdAt/updatedAt columns in schema
  });
  return Manager;
}; 