const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
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
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: false
  });

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
  };

  return Invoice;
}; 