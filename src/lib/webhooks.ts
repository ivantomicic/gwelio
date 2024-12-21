import { supabase } from './supabase';
import { Webhook } from '../types';

export async function getWebhooks(): Promise<Webhook[]> {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function triggerWebhook(url: string, payload: any): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error triggering webhook:', error);
    throw error;
  }
}