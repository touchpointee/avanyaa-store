import mongoose, { Schema, Document, Model } from 'mongoose';

export type MessageStatus = 'new' | 'read' | 'replied';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        subject: { type: String, trim: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
        },
    },
    { timestamps: true }
);

ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: -1 });

const ContactMessage: Model<IContactMessage> =
    mongoose.models.ContactMessage ||
    mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
