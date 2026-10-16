import {
  EntityType,
  FileStatus,
  ScanStatus,
  ValidationMode,
  type ConfirmUploadWebResponse,
  type FileMetadataDTO,
  type FileMetadataWebResponse,
  type GenerateUploadUrlWebResponse,
} from '@volontariapp/contracts';

export const FILE_ID = '5d0e4a3c-7f0b-4b76-9a52-0d1f4f3b9e11';

export const createFileMetadata = (overrides: Partial<FileMetadataDTO> = {}): FileMetadataDTO => ({
  id: FILE_ID,
  ownerId: '76c5b964-b5a1-43e3-85e2-040683457e56',
  objectKey: '',
  mimeType: 'image/jpeg',
  status: FileStatus.FILE_STATUS_PENDING,
  scanStatus: ScanStatus.SCAN_STATUS_SCANNING,
  validationMode: ValidationMode.VALIDATION_MODE_ASYNC,
  entityType: EntityType.ENTITY_TYPE_USER_AVATAR,
  ...overrides,
});

export const createUploadUrlResponse = (
  overrides: Partial<GenerateUploadUrlWebResponse> = {},
): GenerateUploadUrlWebResponse => ({
  fileId: FILE_ID,
  uploadUrl: 'https://s3.cyrus-ag.com/volontariapp-private',
  uploadFields: { key: `quarantine/${FILE_ID}`, 'Content-Type': 'image/jpeg', policy: 'signed' },
  ...overrides,
});

export const createConfirmUploadResponse = (): ConfirmUploadWebResponse => ({
  file: createFileMetadata(),
});

export const createFileMetadataResponse = (): FileMetadataWebResponse => ({
  file: createFileMetadata({ scanStatus: ScanStatus.SCAN_STATUS_CLEAN }),
});
