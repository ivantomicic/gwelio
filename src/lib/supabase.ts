import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://pulwkoymwvvdwmrhkcpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bHdrb3ltd3Z2ZHdtcmhrY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTk3MTksImV4cCI6MjA0ODk3NTcxOX0.ScJKBIiUmj8geWvI0ZDp_hJ3bgozvQ1Q_tn-9aNKQUk';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
}

export async function getAllUsers() {
  console.log('Fetching all users...');
  
  try {
    // First check if we're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current auth state:', user ? 'Authenticated' : 'Not authenticated');

    // Get all users from the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Fetched users:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

export async function registerUser(email: string, password: string, fullName: string) {
  try {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: undefined,
      }
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('Failed to create user');

    // Sign in the user immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw signInError;
    return signInData;

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Registration failed');
  }
}