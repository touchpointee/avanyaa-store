import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    rating: number;       // 1–5
    title: string;
    body: string;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        body: { type: String, required: true, trim: true, maxlength: 1000 },
        isHidden: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
