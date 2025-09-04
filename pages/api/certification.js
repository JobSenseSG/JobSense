// pages/api/certification.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      // Fallback: return sample certifications when Supabase is not configured
      const fallbackCertifications = [
        { id: 1, name: 'AWS Certified Solutions Architect' },
        { id: 2, name: 'Google Cloud Professional Cloud Architect' },
        { id: 3, name: 'Microsoft Azure Fundamentals' },
        { id: 4, name: 'Certified Kubernetes Administrator (CKA)' },
        { id: 5, name: 'Docker Certified Associate' },
        { id: 6, name: 'CompTIA Security+' },
        { id: 7, name: 'Certified Ethical Hacker (CEH)' },
        { id: 8, name: 'PMP (Project Management Professional)' },
        { id: 9, name: 'Scrum Master Certification' },
        { id: 10, name: 'Salesforce Administrator' },
      ];
      return res.status(200).json({ certifications: fallbackCertifications });
    }

    const { data, error } = await supabase.from('certifications').select('*');

    if (error) {
      throw error;
    }

    res.status(200).json({ certifications: data }); // Send the certifications array wrapped in an object
  } catch (error) {
    console.error('Error fetching certifications:', error.message);
    
    // Fallback on any error
    const fallbackCertifications = [
      { id: 1, name: 'AWS Certified Solutions Architect' },
      { id: 2, name: 'Google Cloud Professional Cloud Architect' },
      { id: 3, name: 'Microsoft Azure Fundamentals' },
      { id: 4, name: 'Certified Kubernetes Administrator (CKA)' },
      { id: 5, name: 'Docker Certified Associate' },
    ];
    res.status(200).json({ certifications: fallbackCertifications });
  }
}
