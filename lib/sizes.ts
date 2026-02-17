import connectDB from './db';
import Size from '@/models/Size';
import { BIG_SIZES } from './constants';

/**
 * Returns size names marked as "Big Size" from the database.
 * Used for the Big Size section and product filtering.
 * Falls back to BIG_SIZES constant if no sizes in DB.
 */
export async function getBigSizeNames(): Promise<string[]> {
  try {
    await connectDB();
    const sizes = await Size.find({ isBigSize: true }).sort({ sortOrder: 1 }).lean();
    if (sizes.length > 0) {
      return sizes.map((s) => (s as any).name);
    }
  } catch (e) {
    console.error('getBigSizeNames:', e);
  }
  return [...BIG_SIZES];
}
