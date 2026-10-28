import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Accessories',
        'Books & Stationery',
        'ID & Cards',
        'Clothing',
        'Keys & Wallets',
        'Bags & Backpacks',
        'Other',
      ],
      default: 'Other',
    },
    reportType: {
      type: String,
      required: [true, 'Report type (lost or found) is required'],
      enum: ['lost', 'found'],
    },
    dateLostOrFound: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    campusLocation: {
      type: String,
      required: [true, 'Campus location is required'],
      enum: [
        'Central Library',
        'Student Union / Center',
        'Science & Engineering Hall',
        'Main Cafeteria',
        'Sports Complex / Gymnasium',
        'Arts & Humanities Building',
        'North Dormitories',
        'South Dormitories',
        'Campus Green / Quad',
        'Other',
      ],
      default: 'Other',
    },
    specificLocationDetails: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    identifyingCharacteristics: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['unresolved', 'under_review', 'returned', 'withdrawn'],
      default: 'unresolved',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storageLocation: {
      type: String,
      trim: true,
      default: '',
    },
    contactInfo: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ itemName: 'text', description: 'text', identifyingCharacteristics: 'text' });
itemSchema.index({ category: 1, reportType: 1, status: 1 });
itemSchema.index({ campusLocation: 1 });
itemSchema.index({ submittedBy: 1 });

const Item = mongoose.model('Item', itemSchema);
export default Item;