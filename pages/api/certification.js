// pages/api/certification.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('certifications').select('*');

    if (error) {
      throw error;
    }

    res.status(200).json({ certifications: data }); // Send the certifications array wrapped in an object
  } catch (error) {
    console.error('Error fetching certifications:', error.message);
    res.status(500).json({ error: error.message });
  }
}
