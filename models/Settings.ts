import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrustBadge {
  icon: string;
  label: string;
  sub: string;
}

export interface ITestimonial {
  name: string;
  text: string;
  stars: number;
}

export interface IWhyCard {
  icon: string;
  title: string;
  desc: string;
}

export interface IFaqItem {
  q: string;
  a: string;
}

export interface IFaqCategory {
  category: string;
  icon: string;   // e.g. 'truck' | 'rotateCCW' | 'ruler' | 'creditCard'
  faqs: IFaqItem[];
}

export interface ISettings extends Document {
  key: string;
  trustBadges: ITrustBadge[];
  marqueeMessages: string[];
  testimonials: ITestimonial[];
  whyCards: IWhyCard[];
  faqCategories: IFaqCategory[];
  aboutPage?: Record<string, any>;
  shippingCharge?: number;
  freeShippingThreshold?: number;
}

const TrustBadgeSchema = new Schema<ITrustBadge>({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  sub: { type: String, default: '' },
}, { _id: false });

const TestimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  text: { type: String, required: true },
  stars: { type: Number, default: 5, min: 1, max: 5 },
}, { _id: false });

const WhyCardSchema = new Schema<IWhyCard>({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
}, { _id: false });

const FaqItemSchema = new Schema<IFaqItem>({
  q: { type: String, required: true },
  a: { type: String, required: true },
}, { _id: false });

const FaqCategorySchema = new Schema<IFaqCategory>({
  category: { type: String, required: true },
  icon: { type: String, default: 'helpCircle' },
  faqs: { type: [FaqItemSchema], default: [] },
}, { _id: false });

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, required: true, unique: true },
  trustBadges: { type: [TrustBadgeSchema], default: [] },
  marqueeMessages: { type: [String], default: [] },
  testimonials: { type: [TestimonialSchema], default: [] },
  whyCards: { type: [WhyCardSchema], default: [] },
  faqCategories: { type: [FaqCategorySchema], default: [] },
  aboutPage: { type: mongoose.Schema.Types.Mixed, default: null },
  shippingCharge: { type: Number, default: 0 },
  freeShippingThreshold: { type: Number, default: 0 },
});

if (mongoose.models.Settings) {
  delete (mongoose.models as any).Settings;
}

const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
