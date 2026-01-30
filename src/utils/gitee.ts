// src/utils/gitee.ts
import axios from 'axios';
import { LRUCache } from 'lru-cache';
import * as http from 'http';
import * as https from 'https';

const GITEE_API = 'https://gitee.com/api/v5';
const GITEE_PAT = process.env.GITEE_PAT!;
const GITEE_OWNER = process.env.GITEE_OWNER!;
const GITEE_REPO = process.env.GITEE_REPO!;
const GITEE_BRANCH = process.env.GITEE_BRANCH || 'master';

const TEXT_TTL = Number(process.env.GITEE_CACHE_TTL_MS || 30_000);
const IMG_TTL  = Number(process.env.GITEE_IMG_CACHE_TTL_MS || 60_000);

const textCache = new LRUCache<string, string>({ max: 500, ttl: TEXT_TTL, updateAgeOnGet: true });
const imgCache  = new LRUCache<string, Buffer>({ max: 300, ttl: IMG_TTL, updateAgeOnGet: true });

const inflightText = new Map<string, Promise<string>>();
const inflightImg  = new Map<string, Promise<Buffer>>();

const giteeAxios = axios.create({
  baseURL: GITEE_API,
  timeout: 15_000,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 10_000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 10_000 }),
  headers: {
    'User-Agent': 'NextBlog-GiteeClient/1.0',
    'Accept': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 300,
});

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function keyOf(path: string): string {
  return `${GITEE_BRANCH}:${path}`;
}

function isRetryableError(err: any): boolean {
  const code = err?.code;
  const status = err?.response?.status;
  if (status && status >= 500) return true;
  // ECONNABORTED = axios timeout, 加入重试列表
  return ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNABORTED'].includes(code);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWithRetry<T>(url: string, params: Record<string, any>, maxTries = 5): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt < maxTries) {
    attempt++;
    try {
      const t0 = Date.now();
      const res = await giteeAxios.get<T>(url, { params });
      const dt = Date.now() - t0;
      if (dt > 300) {
        console.log(`[Gitee API] GET ${url} (${dt}ms)`);
      }
      return res.data;
    } catch (err: any) {
      lastErr = err;
      if (attempt >= maxTries || !isRetryableError(err)) break;
      // 指数退避: 1s, 2s, 4s, 8s...
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 16000) + Math.floor(Math.random() * 500);
      console.warn(`[Gitee API] Retry ${attempt}/${maxTries} after ${backoff}ms: ${url} (${err?.code || err?.message})`);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

export async function getFileContent(path: string): Promise<string> {
  const encodedPath = encodePath(path);
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${encodedPath}`;
  const cacheKey = keyOf(encodedPath);

  const cached = textCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const inflight = inflightText.get(cacheKey);
  if (inflight) return inflight;

  const p = (async () => {
    try {
      console.log(`[Gitee API] Requesting: ${url} (orig: ${path})`);
      const data = await getWithRetry<any>(url, { access_token: GITEE_PAT, ref: GITEE_BRANCH });
      if (data?.content) {
        const text = Buffer.from(data.content, 'base64').toString('utf-8');
        textCache.set(cacheKey, text);
        return text;
      }
    throw new Error(`No content found for ${path}`);
  } catch (error: any) {
      console.error(`[Gitee API] Error for ${path}:`, error?.message || error);
    throw error;
    } finally {
      inflightText.delete(cacheKey);
  }
  })();

  inflightText.set(cacheKey, p);
  return p;
}

export async function getImageBuffer(path: string): Promise<Buffer> {
  const encodedPath = encodePath(path);
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${encodedPath}`;
  const cacheKey = keyOf(encodedPath);

  const cached = imgCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const inflight = inflightImg.get(cacheKey);
  if (inflight) return inflight;

  const p = (async () => {
    try {
      const data = await getWithRetry<any>(url, { access_token: GITEE_PAT, ref: GITEE_BRANCH });
      if (data?.content) {
        const buf = Buffer.from(data.content, 'base64');
        imgCache.set(cacheKey, buf);
        return buf;
      }
    throw new Error(`No content found for image ${path}`);
    } catch (error: any) {
      console.error(`[Gitee API] Error getting image buffer for ${path}:`, error?.message || error);
    throw error;
    } finally {
      inflightImg.delete(cacheKey);
  }
  })();

  inflightImg.set(cacheKey, p);
  return p;
}

export async function getFileTree(sha: string = GITEE_BRANCH): Promise<any> {
  try {
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}/git/trees/${sha}`;
    return await getWithRetry<any>(url, { access_token: GITEE_PAT, recursive: 1 });
  } catch (error: any) {
    console.error('Error getting file tree:', error?.message || error);
    throw error;
  }
}

export async function getRepoInfo(): Promise<any> {
  try {
    const url = `/repos/${GITEE_OWNER}/${GITEE_REPO}`;
    return await getWithRetry<any>(url, { access_token: GITEE_PAT });
  } catch (error: any) {
    console.error('Error getting repo info:', error?.message || error);
    throw error;
  }
}

export default giteeAxios;
