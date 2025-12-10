export type GarageNoteType = 'servis' | 'bakim' | 'yedek_parca' | 'lastik' | 'sigorta' | 'vergiler' | 'diger';

export interface GarageNote {
  id: string;
  type: GarageNoteType;
  title: string;
  description: string | null;
  date: string; // ISO date string
  mileage: number | null;
  cost: number | null;
  service_location: string | null;
  images: Array<{ url: string; public_id: string }>;
  created_at: string;
  updated_at: string;
}

export interface GarageNoteStats {
  total_cost: number;
  total_notes: number;
  category_costs: Array<{
    type: GarageNoteType;
    total_cost: number;
    count: number;
  }>;
  last_maintenance: {
    date: string;
    mileage: number | null;
    type: GarageNoteType;
    title: string;
  } | null;
  max_mileage: number | null;
}

export interface CreateGarageNoteData {
  type: GarageNoteType;
  title: string;
  description?: string;
  date: string;
  mileage?: number;
  cost?: number;
  service_location?: string;
  images?: Array<{ url: string; public_id: string }>;
}

export interface UpdateGarageNoteData extends Partial<CreateGarageNoteData> {}

export const GARAGE_NOTE_TYPE_LABELS: Record<GarageNoteType, { label: string; emoji: string; color: string }> = {
  servis: { label: 'Servis', emoji: '🛠️', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  bakim: { label: 'Bakım', emoji: '⚙️', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  yedek_parca: { label: 'Yedek Parça', emoji: '🔧', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  lastik: { label: 'Lastik', emoji: '🛞', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  sigorta: { label: 'Sigorta', emoji: '🛡️', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  vergiler: { label: 'Vergiler', emoji: '📋', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  diger: { label: 'Diğer', emoji: '📝', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
};

export const GARAGE_NOTE_TYPES: Array<{ value: GarageNoteType; label: string; emoji: string }> = [
  { value: 'servis', label: 'Servis', emoji: '🛠️' },
  { value: 'bakim', label: 'Bakım', emoji: '⚙️' },
  { value: 'yedek_parca', label: 'Yedek Parça', emoji: '🔧' },
  { value: 'lastik', label: 'Lastik', emoji: '🛞' },
  { value: 'sigorta', label: 'Sigorta', emoji: '🛡️' },
  { value: 'vergiler', label: 'Vergiler', emoji: '📋' },
  { value: 'diger', label: 'Diğer', emoji: '📝' },
];
