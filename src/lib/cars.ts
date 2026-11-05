import { supabase } from './supabase';

export type CarStatus = 'active' | 'expired' | 'suspended';

export type Car = {
  id: string;
  qr_code: string;
  plate_number: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  owner_name: string | null;
  status: CarStatus;
  notes: string | null;
  created_at: string;
};

const MAX_CODE_LENGTH = 200;

/**
 * Looks a scanned QR value up in the `cars` table.
 * Resolves to `null` when the car is not in the registry; throws on network/DB errors.
 */
export async function findCarByCode(rawCode: string): Promise<Car | null> {
  const code = rawCode.trim();
  // Real registry codes are short; anything huge can't be a match, so skip the round trip.
  if (!code || code.length > MAX_CODE_LENGTH) return null;

  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('qr_code', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Car | null) ?? null;
}
