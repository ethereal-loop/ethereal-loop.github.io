import { md5 } from "hash-wasm";

export async function buildMusicUrl(musicName: string): Promise<string> {
  const fileId = (await md5(musicName)).slice(0, 20);
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  return `https://${endpoint}/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

export function getURL(musicName: string, source: string): string {
  const match = musicName.match(/^(\d+)_|-(\d+)$/);
  const id = match ? (match[1] || match[2]) : "";
  return `https://${source}/${id}`;
}

export function extractDomain(url:string) {
  const domain = url.split('/')[0];
  const parts = domain.split('.');
  return parts[parts.length - 2]||url;
}

