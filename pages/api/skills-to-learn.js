// pages/api/skills-to-learn.js
const axios = require('axios');
const crypto = require('crypto');

const region = process.env.AWS_REGION || 'us-east-1';
const service = 'bedrock';
const host = `bedrock.${region}.amazonaws.com`;
const endpoint = `https://${host}/v1/models/claude-ai:invoke`;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

function sign(key, msg) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = sign(`AWS4${key}`, dateStamp);
  const kRegion = sign(kDate, regionName);
  const kService = sign(kRegion, serviceName);
  const kSigning = sign(kService, 'aws4_request');
  return kSigning;
}

function createSignedRequest(params) {
  const method = 'POST';
  const canonicalUri = '/v1/models/claude-ai:invoke';
  const canonicalQueryString = '';
  const contentType = 'application/json';

  const t = new Date();
  const amzDate = t.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = t.toISOString().substring(0, 10).replace(/-/g, '');

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';

  const payloadHash = crypto.createHash('sha256').update(params).digest('hex');
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')}`;

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    endpoint,
    headers: {
      'Content-Type': contentType,
      'X-Amz-Date': amzDate,
      'Authorization': authorizationHeader,
    },
    data: params,
  };
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { resumeText, previousResponse } = req.body;
    try {
      const prompt = `You are helping a friend upskill himself so that he can get a job in the tech industry. Based on his resume/information below, give 1 skill you would recommend him to learn? 
: ${resumeText} Please return the title of the skill AND give why he should learn it in 100 words. Do NOT recommend the same language in ${previousResponse} please use a DIFFERENT RECOMMENDATION ALL THE TIME`;

      const params = JSON.stringify({
        ModelId: 'Claude',
        Prompt: prompt,
        MaxTokens: 150,
      });

      const { endpoint, headers, data } = createSignedRequest(params);

      const response = await axios.post(endpoint, data, { headers });
      const text = response.data.Output;

      return res.status(200).send(text);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
