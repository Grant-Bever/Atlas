const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Make sure bcrypt is installed

module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Manager.hasMany(models.Timesheet, { foreignKey: 'manager_id', as: 'timesheets' });
      Manager.hasMany(models.Inventory, { foreignKey: 'manager_id', as: 'inventoryItems' });
    }

    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password_hash);
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
    encrypted_phone_number: { // Renamed for clarity
      type: DataTypes.STRING(255), // Store as string, actual encryption handled in service/controller
      allowNull: true
    },
    password_hash: { // Renamed from password
      type: DataTypes.STRING(255),
      allowNull: false // Reverted to NOT NULL
    }
  }, {
    sequelize,
    modelName: 'Manager',
    tableName: 'managers', // Explicitly set table name to lowercase plural
    timestamps: true, // Enabled timestamps
    hooks: {
      beforeCreate: async (manager) => {
        if (manager.password_hash) { // Check if password is provided (it should be)
          const salt = await bcrypt.genSalt(10);
          manager.password_hash = await bcrypt.hash(manager.password_hash, salt);
        }
      },
      beforeUpdate: async (manager) => {
        if (manager.changed('password_hash') && manager.password_hash) {
          const salt = await bcrypt.genSalt(10);
          manager.password_hash = await bcrypt.hash(manager.password_hash, salt);
        }
      }
    }
  });
  return Manager;
}; 