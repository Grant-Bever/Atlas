const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
    }
  }
  Invoice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    checked_out: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Matches schema definition
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: false
  });
  return Invoice;
}; 