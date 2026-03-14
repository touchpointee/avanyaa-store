import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryHistory extends Document {
    productId: mongoose.Types.ObjectId;
    productName: string;
    variant: {
        size: string;
        color: string;
    };
    changeAmount: number;
    reason: string;
    referenceId?: string; // Optional order ID or admin user ID
    createdAt: Date;
    updatedAt: Date;
}

const InventoryHistorySchema = new Schema<IInventoryHistory>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        variant: {
            size: { type: String, required: true },
            color: { type: String, required: true },
        },
        changeAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        referenceId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

InventoryHistorySchema.index({ productId: 1 });
InventoryHistorySchema.index({ createdAt: -1 });

const InventoryHistory: Model<IInventoryHistory> =
    mongoose.models.InventoryHistory || mongoose.model<IInventoryHistory>('InventoryHistory', InventoryHistorySchema);

export default InventoryHistory;
