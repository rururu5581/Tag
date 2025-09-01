
import type { TagCategory } from './types';

export const TAG_CATEGORIES: Record<TagCategory, { name: string; color: string }> = {
  information: { name: '情報', color: 'bg-blue-100 text-blue-800' },
  conditions: { name: '条件', color: 'bg-green-100 text-green-800' },
  preferences: { name: '希望', color: 'bg-yellow-100 text-yellow-800' },
  personality: { name: 'その他・人柄', color: 'bg-purple-100 text-purple-800' },
};
