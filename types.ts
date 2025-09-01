
export type TagCategory = 'information' | 'conditions' | 'preferences' | 'personality';

export interface GeneratedTags {
  information: string[];
  conditions: string[];
  preferences: string[];
  personality: string[];
}
