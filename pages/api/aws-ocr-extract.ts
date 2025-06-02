import type { NextApiRequest, NextApiResponse } from 'next';
import {
  TextractClient,
  AnalyzeDocumentCommand,
} from '@aws-sdk/client-textract';
import * as formidable from 'formidable'; // 👈 fix import here
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = formidable.default({ multiples: false }); // ✅ Correct for ESM import

  form.parse(req, async (err, fields, files) => {
    if (err || !files.document) {
      console.error('Formidable parse error:', err);
      return res.status(400).json({ error: 'File upload failed' });
    }

    const file = Array.isArray(files.document)
      ? files.document[0]
      : files.document;
    const fileBuffer = fs.readFileSync(file.filepath);

    try {
      const command = new AnalyzeDocumentCommand({
        Document: { Bytes: fileBuffer },
        FeatureTypes: ['TABLES', 'FORMS'],
      });

      const response = await textractClient.send(command);

      const extractedText =
        response.Blocks?.filter((b) => b.BlockType === 'LINE')
          .map((line) => line.Text)
          .join(' ') || '';

      return res.status(200).json({ extractedText });
    } catch (error) {
      console.error('Textract Error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to process document with Textract' });
    }
  });
};

export default handler;
