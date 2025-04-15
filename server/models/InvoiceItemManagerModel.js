const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    static associate(models) {
      InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
      // If this item refers to an Inventory item, define the association:
      // InvoiceItem.belongsTo(models.Inventory, { foreignKey: 'inventory_id', as: 'inventoryItem' });
    }
  }
  InvoiceItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2)
    },
    notes: {
      type: DataTypes.TEXT
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    item: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // Add inventory_id if linking directly to Inventory table
    // inventory_id: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Inventory',
    //     key: 'id'
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'SET NULL' // Or CASCADE/RESTRICT as needed
    // },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Matches schema definition
    }
  }, {
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice_items',
    timestamps: false
  });
  return InvoiceItem;
}; 