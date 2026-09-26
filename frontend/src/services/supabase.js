import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey.length > 10
  );
};

// Initialize Supabase Client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// HIVEFIVE SUPABASE DATA ACCESS UTILITIES
// ====================================================================

/**
 * Fetch all hives from Supabase
 */
export async function getSupabaseHives() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hives')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.warn('[Supabase] Hives query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch a single hive by its UUID or Hive Code
 */
export async function getSupabaseHiveById(hiveId) {
  if (!supabase) return null;
  
  // Try by UUID
  let { data, error } = await supabase
    .from('hives')
    .select('*')
    .eq('id', hiveId)
    .maybeSingle();

  // If not found, try by hive_code
  if (!data) {
    const res = await supabase
      .from('hives')
      .select('*')
      .eq('hive_code', hiveId)
      .maybeSingle();
    data = res.data;
  }

  return data;
}

/**
 * Insert a new hive into Supabase
 */
export async function insertSupabaseHive(hiveRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hives')
    .insert([hiveRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert Hive error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch telemetry for a given hive
 */
export async function getSupabaseTelemetry(hiveId, limit = 24) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hive_telemetry')
    .select('*')
    .eq('hive_id', hiveId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[Supabase] Telemetry query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Save new telemetry record to Supabase
 */
export async function insertSupabaseTelemetry(telemetryRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hive_telemetry')
    .insert([telemetryRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert Telemetry error:', error.message);
    return null;
  }
  return data;
}

/**
 * Save AI health result to Supabase
 */
export async function insertSupabaseAiResult(aiRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hive_ai_results')
    .insert([aiRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert AI Result error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch all beekeeper actions with hive info
 */
export async function getSupabaseActions() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('beekeeper_actions')
    .select('*, hives(hive_code)')
    .order('action_timestamp', { ascending: false });

  if (error) {
    console.warn('[Supabase] Actions query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Save Beekeeper action/inspection to Supabase
 */
export async function insertSupabaseAction(actionRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('beekeeper_actions')
    .insert([actionRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert Action error:', error.message);
    return null;
  }
  return data;
}

/**
 * Upload inspection photo to Supabase Storage with local dataURL fallback
 */
export async function uploadInspectionImage(file, hiveId = 'H001') {
  if (!file) return null;

  // Try Supabase Storage
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${hiveId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('hive-inspections')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('hive-inspections')
          .getPublicUrl(fileName);
        return publicUrlData?.publicUrl || fileName;
      }
    } catch (e) {
      console.warn('[Supabase Storage] Upload error, falling back to base64 preview:', e.message);
    }
  }

  // Fallback: Read as base64 string
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch honey batches from Supabase
 */
export async function getSupabaseHoneyBatches() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('honey_batches')
    .select('*')
    .order('harvest_date', { ascending: false });

  if (error) {
    console.warn('[Supabase] Honey Batches query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch a single honey batch by batch_id (text, e.g. HC-2026-001)
 */
export async function getSupabaseHoneyBatchByBatchId(batchId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('honey_batches')
    .select('*')
    .eq('batch_id', batchId)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Honey Batch lookup error:', error.message);
    return null;
  }
  return data;
}

/**
 * Create new honey batch in Supabase
 */
export async function insertSupabaseHoneyBatch(batchRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('honey_batches')
    .insert([batchRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert Honey Batch error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch batch events for traceability from Supabase
 */
export async function getSupabaseBatchEvents(batchUuid) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('batch_events')
    .select('*')
    .eq('batch_id', batchUuid)
    .order('event_date', { ascending: true });

  if (error) {
    console.warn('[Supabase] Batch Events query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Insert a batch event
 */
export async function insertSupabaseBatchEvent(eventRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('batch_events')
    .insert([eventRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert Batch Event error:', error.message);
    return null;
  }
  return data;
}

/**
 * Get or create QR Verification record by verification token
 */
export async function getSupabaseQrVerificationByToken(token) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('qr_verifications')
    .select('*, honey_batches(*)')
    .eq('verification_token', token)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] QR Verification query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Save new QR verification token to Supabase
 */
export async function insertSupabaseQrToken(qrRecord) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('qr_verifications')
    .insert([qrRecord])
    .select();

  if (error) {
    console.warn('[Supabase] Insert QR Token error:', error.message);
    return null;
  }
  return data;
}

/**
 * Increment scan_count on a QR verification record
 */
export async function incrementQrScanCount(verificationId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('qr_verifications')
    .update({ 
      last_scanned_at: new Date().toISOString()
    })
    .eq('id', verificationId)
    .select();

  if (error) {
    console.warn('[Supabase] Increment scan count error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch AI results for a given hive
 */
export async function getSupabaseAiResults(hiveId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('hive_ai_results')
    .select('*')
    .eq('hive_id', hiveId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.warn('[Supabase] AI Results query error:', error.message);
    return null;
  }
  return data;
}

/**
 * Quick connection test
 */
export async function testSupabaseConnection() {
  if (!supabase) return { connected: false, reason: 'Supabase client not configured' };
  
  try {
    const { data, error } = await supabase
      .from('hives')
      .select('id')
      .limit(1);

    if (error) {
      return { connected: false, reason: error.message, code: error.code };
    }
    return { connected: true, rowCount: data?.length ?? 0 };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}
