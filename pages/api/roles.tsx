import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type JobRow = Record<string, string>;

function parseCSVRow(row: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}

async function readJobsCsv(): Promise<{ headers: string[]; rows: JobRow[] }> {
  const csvPath = path.join(process.cwd(), 'scripts', 'jobs.csv');
  const raw = await fs.promises.readFile(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headerCols = parseCSVRow(lines[0]).map(h => h.replace(/^\s+|\s+$/g, '').replace(/^"|"$/g, '').toLowerCase());
  const rows: JobRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCSVRow(lines[i]);
      while (cols.length < headerCols.length) cols.push('');
      const obj: JobRow = {};
      for (let j = 0; j < headerCols.length; j++) {
        obj[headerCols[j]] = cols[j] ? cols[j].replace(/^"|"$/g, '') : '';
      }
      rows.push(obj);
    } catch (e) {
      continue;
    }
  }
  return { headers: headerCols, rows };
}

type ResponseData = { message?: string } | any;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not supported' });
  }

  const title = req.body?.title;
  if (!title || !title.toString().trim()) {
    return res.status(400).json({ message: 'Title must not be null' });
  }

  // Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .ilike('title', `%${title}%`)
        .limit(10);

      if (error) throw error;
      if (data && Array.isArray(data) && data.length > 0) {
        return res.status(200).json(data);
      }
      // if no rows, fall through to CSV fallback
    } catch (err: any) {
      console.error('Supabase query failed, falling back to CSV', err?.message || err);
      // continue to CSV fallback
    }
  }

  // CSV fallback
  try {
    const { rows } = await readJobsCsv();
  const q = title.toString().toLowerCase();
    const matches: any[] = [];
    for (const r of rows) {
      const rowTitle = (r.title || '').toLowerCase();
      if (!rowTitle) continue;
      const qWords: string[] = q.split(/\s+/).filter(Boolean);
      if (rowTitle.includes(q) || qWords.some((w: string) => rowTitle.includes(w))) {
        const skillsField = (r.skills || '').trim();
        const skills = skillsField ? skillsField.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean) : [];
        matches.push({
          title: r.title || '',
          company: r.company || '',
          skills_required: skills,
          job_url: r.job_url || r.job_url_direct || null,
          location: r.location || null,
        });
        if (matches.length >= 10) break;
      }
    }

    if (matches.length) return res.status(200).json(matches);
  } catch (err) {
    console.error('CSV read failed', err);
  }

  // Generic fallback
  const fallback = [
    {
      title: title || 'Software Engineer',
      company: 'Acme',
      skills_required: ['Python', 'SQL', 'Communication'],
      job_url: null,
    },
    {
      title: `Senior ${title || 'Engineer'}`,
      company: 'Example',
      skills_required: ['System Design', 'Leadership', 'SQL'],
      job_url: null,
    },
  ];
  return res.status(200).json(fallback);
}
