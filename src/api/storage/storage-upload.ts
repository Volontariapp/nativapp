import { InternalServerError } from '@volontariapp/errors';
import type { GenerateUploadUrlWebResponse } from '@volontariapp/contracts';
import { config } from '../../shared/config/base-config';
import { createApiError } from '../core/api-error.factory';
import type { UploadableFile } from './storage-upload.types';

const hostnameOf = (url: string): string | null =>
  /^https:\/\/([^/:?#]+)/i.exec(url)?.[1]?.toLowerCase() ?? null;

const siteOf = (hostname: string): string => hostname.split('.').slice(-2).join('.');

/**
 * Le token Cloudflare Access n'est envoye qu'a un hote HTTPS du meme site que la gateway
 * (par exemple s3.cyrus-ag.com pour api-volontariapp.cyrus-ag.com), jamais a une autre URL.
 */
const buildCloudflareHeaders = (uploadUrl: string): Record<string, string> => {
  const access = config.cloudflareAccess;
  if (access == null || access.clientId === '' || access.clientSecret === '') {
    return {};
  }
  const uploadHost = hostnameOf(uploadUrl);
  const apiHost = hostnameOf(config.apiGatewayUrl);
  if (uploadHost === null || apiHost === null || siteOf(uploadHost) !== siteOf(apiHost)) {
    return {};
  }
  return {
    'CF-Access-Client-Id': access.clientId,
    'CF-Access-Client-Secret': access.clientSecret,
  };
};

/**
 * Les champs signes doivent preceder le fichier : S3 ignore tout ce qui suit le champ `file`.
 */
const buildFormData = (fields: Record<string, string>, file: UploadableFile): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([name, value]) => {
    formData.append(name, value);
  });
  formData.append('file', file);
  return formData;
};

export const uploadToPresignedPost = async (
  upload: GenerateUploadUrlWebResponse,
  file: UploadableFile,
): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(upload.uploadUrl, {
      method: 'POST',
      // Pas de Content-Type : le runtime ajoute le multipart avec sa frontiere.
      headers: buildCloudflareHeaders(upload.uploadUrl),
      body: buildFormData(upload.uploadFields, file),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new InternalServerError(`Erreur réseau: ${message}`, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    throw createApiError(response.status, "Échec de l'envoi du fichier");
  }
};
