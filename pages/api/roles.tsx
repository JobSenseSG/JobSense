import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `https://vajvudbmcgzbyivvtlvy.supabase.co`;
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhanZ1ZGJtY2d6YnlpdnZ0bHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA3NTMxOTAsImV4cCI6MjAzNjMyOTE5MH0.NSt8sCe1d6a2wKsHk_nROH9jtkuSzChc-2V8Nj_V150`;
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
  if (req.method === "POST") {
    if (!req.body.title) {
      return res.status(400).json({ message: "Title must not be null" });
    }

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .ilike("title", `%${req.body.title}%`)
        .limit(5);

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(400).json({ message: "Method not supported" });
  }
}
