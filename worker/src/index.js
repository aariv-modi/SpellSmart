const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const OAUTH_ENDPOINT = 'https://oauth2.googleapis.com/token';
const TOKEN_CACHE_KEY = 'https://internal/gcp-access-token';
const DICT_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const MAX_TEXT_LENGTH = 200;
const MAX_WORD_LENGTH = 60;
const VOICE_NAME = 'en-US-Neural2-D';
const LANGUAGE_CODE = 'en-US';
// Bump when SSML handling or any other transformation changes — invalidates the edge cache.
const CACHE_VERSION = 'v2';

const isSSML = (text) => {
  const t = text.trim();
  return t.startsWith('<speak') && t.endsWith('</speak>');
};

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname === '/define') {
      return handleDefine(url, ctx);
    }
    return handleTTS(url, env, ctx);
  },
};

async function handleTTS(url, env, ctx) {
  const text = url.searchParams.get('text');
  if (!text) return new Response('Missing ?text', { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response('Text too long', { status: 400 });
  }

  const cache = caches.default;
  const cacheKey = new Request(
    `https://tts-cache/${CACHE_VERSION}/${encodeURIComponent(VOICE_NAME)}/${encodeURIComponent(text)}`,
    { method: 'GET' },
  );
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const accessToken = await getAccessToken(env, ctx);
  if (!accessToken) return new Response('Auth failed', { status: 502 });

  const input = isSSML(text) ? { ssml: text } : { text };
  const ttsRes = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      voice: { languageCode: LANGUAGE_CODE, name: VOICE_NAME },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!ttsRes.ok) {
    const detail = await ttsRes.text();
    return new Response(`TTS upstream error: ${detail}`, { status: 502 });
  }

  const data = await ttsRes.json();
  const audioBytes = base64ToBytes(data.audioContent);

  const response = new Response(audioBytes, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=2592000, immutable',
    },
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function handleDefine(url, ctx) {
  const word = (url.searchParams.get('word') || '').trim().toLowerCase();
  if (!word) return jsonResponse({ error: 'Missing ?word' }, 400);
  if (word.length > MAX_WORD_LENGTH) return jsonResponse({ error: 'Word too long' }, 400);

  const cache = caches.default;
  const cacheKey = new Request(
    `https://def-cache/${CACHE_VERSION}/${encodeURIComponent(word)}`,
    { method: 'GET' },
  );
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let dictRes;
  try {
    dictRes = await fetch(`${DICT_ENDPOINT}/${encodeURIComponent(word)}`);
  } catch {
    return jsonResponse({ word, definitions: [] }, 502);
  }

  let payload;
  if (dictRes.status === 404) {
    payload = { word, definitions: [] };
  } else if (!dictRes.ok) {
    return jsonResponse({ word, definitions: [] }, 502);
  } else {
    const data = await dictRes.json();
    payload = { word, definitions: extractDefinitions(data) };
  }

  const response = jsonResponse(payload, 200, 'public, max-age=2592000, immutable');
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function extractDefinitions(data) {
  const out = [];
  for (const entry of data) {
    for (const meaning of entry.meanings ?? []) {
      for (const def of meaning.definitions ?? []) {
        if (def.definition) {
          out.push({ partOfSpeech: meaning.partOfSpeech, definition: def.definition });
          if (out.length >= 3) return out;
        }
      }
    }
  }
  return out;
}

function jsonResponse(body, status = 200, cacheControl = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}

async function getAccessToken(env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(TOKEN_CACHE_KEY, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return await cached.text();

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: env.GCP_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: OAUTH_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };

  const jwt = await signJWT(claim, env.GCP_PRIVATE_KEY);

  const tokenRes = await fetch(OAUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!tokenRes.ok) return null;

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;

  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(accessToken, {
        headers: { 'Cache-Control': 'public, max-age=3000' },
      }),
    ),
  );
  return accessToken;
}

async function signJWT(claim, privateKeyPem) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimB64 = base64UrlEncode(JSON.stringify(claim));
  const signingInput = `${headerB64}.${claimB64}`;

  const privateKey = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

async function importPrivateKey(pem) {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const binaryDer = base64ToBytes(cleaned);
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

function base64UrlEncode(str) {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlEncodeBytes(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
