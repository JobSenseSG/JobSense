import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

type ResponseData =
  | {
      message: string;
    }
  | any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    if (!req.body.title) {
      return res.status(400).json({ message: 'Title must not be null' });
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .ilike('title', `%${req.body.title}%`)
        .limit(10);

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: 'Method not supported' });
  }
}
