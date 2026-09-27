import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from './database.types';

let supabaseClient: SupabaseClient<Database> | undefined;

export function isSupabaseConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!isSupabaseConfigured() || !url || !key) {
    throw new Error(
      'Supabase is not configured correctly. Copy client/.env.example to client/.env and add a valid project URL and publishable key.',
    );
  }

  supabaseClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
      lock: processLock,
      persistSession: true,
      storage: AsyncStorage,
    },
  });

  return supabaseClient;
}
