import * as mockContracts from './contracts.mock';
import * as mockErrors from './errors.mock';
import { uploadToPresignedPost } from '../storage-upload';
import { createUploadUrlResponse } from './storage.factory';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@volontariapp/errors', () => mockErrors, { virtual: true });

const mockConfig = {
  apiGatewayUrl: 'https://api-volontariapp.cyrus-ag.com',
  cloudflareAccess: { clientId: 'cf-id', clientSecret: 'cf-secret' },
};

jest.mock('../../../shared/config/base-config', () => ({
  get config() {
    return mockConfig;
  },
}));

const file = { uri: 'file:///cache/avatar.jpg', name: 'avatar.jpg', type: 'image/jpeg' };

const lastRequest = (
  fetchSpy: jest.SpiedFunction<typeof fetch>,
): { url: string; init: RequestInit } => {
  const [url, init] = fetchSpy.mock.calls[0] ?? [];
  return { url: typeof url === 'string' ? url : '', init: init ?? {} };
};

const headersOf = (init: RequestInit): Record<string, string> =>
  Object.fromEntries(new Headers(init.headers).entries());

describe('uploadToPresignedPost', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockConfig.cloudflareAccess = { clientId: 'cf-id', clientSecret: 'cf-secret' };
  });

  it('posts to the presigned url', async () => {
    const upload = createUploadUrlResponse();

    await uploadToPresignedPost(upload, file);

    const { url, init } = lastRequest(fetchSpy);
    expect(url).toBe(upload.uploadUrl);
    expect(init.method).toBe('POST');
  });

  it('appends the signed fields first and the file last', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const upload = createUploadUrlResponse();

    await uploadToPresignedPost(upload, file);

    expect(appendSpy.mock.calls.map(([name]) => name)).toEqual([
      ...Object.keys(upload.uploadFields),
      'file',
    ]);
  });

  it('lets the runtime set the multipart boundary', async () => {
    await uploadToPresignedPost(createUploadUrlResponse(), file);

    expect(Object.keys(headersOf(lastRequest(fetchSpy).init))).not.toContain('content-type');
  });

  it('sends the Cloudflare Access headers to a host of the same site as the API', async () => {
    await uploadToPresignedPost(createUploadUrlResponse(), file);

    expect(headersOf(lastRequest(fetchSpy).init)).toMatchObject({
      'cf-access-client-id': 'cf-id',
      'cf-access-client-secret': 'cf-secret',
    });
  });

  it('never sends the Cloudflare Access headers to another site', async () => {
    const upload = createUploadUrlResponse({ uploadUrl: 'https://evil.example.com/bucket' });

    await uploadToPresignedPost(upload, file);

    expect(headersOf(lastRequest(fetchSpy).init)).not.toHaveProperty('cf-access-client-id');
    expect(headersOf(lastRequest(fetchSpy).init)).not.toHaveProperty('cf-access-client-secret');
  });

  it('never sends the Cloudflare Access headers over plain http', async () => {
    const upload = createUploadUrlResponse({ uploadUrl: 'http://s3.cyrus-ag.com/bucket' });

    await uploadToPresignedPost(upload, file);

    expect(headersOf(lastRequest(fetchSpy).init)).not.toHaveProperty('cf-access-client-id');
  });

  it('sends no Cloudflare Access headers when none are configured', async () => {
    mockConfig.cloudflareAccess = { clientId: '', clientSecret: '' };

    await uploadToPresignedPost(createUploadUrlResponse(), file);

    expect(headersOf(lastRequest(fetchSpy).init)).not.toHaveProperty('cf-access-client-id');
  });

  it('turns a rejected upload into an API error carrying the status', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(uploadToPresignedPost(createUploadUrlResponse(), file)).rejects.toMatchObject({
      code: '403',
    });
  });

  it('turns a network failure into a network error', async () => {
    fetchSpy.mockRejectedValue(new Error('offline'));

    await expect(uploadToPresignedPost(createUploadUrlResponse(), file)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });
});
