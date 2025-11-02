// src/utils/dogecloud.ts
import crypto from 'crypto';
import axios from 'axios';

const API_HOST = 'https://api.dogecloud.com';
const OSS_BUCKET = process.env.OSS_BUCKET || 'blur-oss';
const OSS_ACCESS_KEY = process.env.OSS_ACCESS_KEY!;
const OSS_SECRET_KEY = process.env.OSS_SECRET_KEY!;
const OSS_PUBLIC_URL = process.env.OSS_PUBLIC_URL || 'https://oss.cdn.sdjz.wiki';
const OSS_UPLOAD_PATH = process.env.OSS_UPLOAD_PATH || 'images/';

// 生成 DogeCloud API 鉴权 Token
function generateAuthToken(requestUri: string, body = ''): string {
  const signStr = `${requestUri}\n${body}`;
  const sign = crypto
    .createHmac('sha1', OSS_SECRET_KEY)
    .update(signStr, 'utf-8')
    .digest('hex');
  return `TOKEN ${OSS_ACCESS_KEY}:${sign}`;
}

// 生成基于内容 Hash 的确定性文件名
export function generateFileName(contentHash: string, originalName: string): string {
  const ext = originalName.match(/\.[^.]+$/)?.[0] || '.png';
  // 使用内容 Hash 的前 16 位作为文件名（确定性 + 防冲突）
  return `${contentHash.slice(0, 16)}${ext}`;
}

// 生成完整的 OSS URL（提前预知）
export function getOssUrl(fileName: string): string {
  const path = OSS_UPLOAD_PATH + fileName;
  return `${OSS_PUBLIC_URL.replace(/\/$/, '')}/${path}`;
}

// 上传文件到 DogeCloud OSS（使用 PUT API）
export async function uploadToDogeCloud(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    const key = OSS_UPLOAD_PATH + fileName;
    const requestUri = `/oss/upload/put.json?bucket=${OSS_BUCKET}&key=${key}`;
    
    const authToken = generateAuthToken(requestUri, '');
    
    const response = await axios.put(
      `${API_HOST}${requestUri}`,
      buffer,
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 60000, // 60秒超时
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    if (response.data.code !== 200) {
      throw new Error(`DogeCloud upload failed: ${response.data.msg}`);
    }
    
    // 返回预先生成的 URL（与 getOssUrl 一致）
    const finalUrl = getOssUrl(fileName);
    console.log(`[DogeCloud] Uploaded: ${fileName} -> ${finalUrl}`);
    
    return finalUrl;
  } catch (error: any) {
    console.error(`[DogeCloud] Upload failed for ${fileName}:`, error.message);
    throw error;
  }
}

