// @volontariapp/contracts est ESM uniquement et inutilisable sous Jest (voir jest.setup.js).
// Valeurs alignees sur proto-registry/proto/volontariapp/storage/storage.proto.
export const EntityType = {
  ENTITY_TYPE_UNSPECIFIED: 0,
  ENTITY_TYPE_POST: 1,
  ENTITY_TYPE_USER_AVATAR: 2,
  ENTITY_TYPE_BADGE_ICON: 3,
  ENTITY_TYPE_EVENT_COVER: 4,
} as const;

export const FileStatus = {
  FILE_STATUS_UNSPECIFIED: 0,
  FILE_STATUS_PENDING: 1,
  FILE_STATUS_ATTACHED: 2,
  FILE_STATUS_ORPHANED: 3,
  FILE_STATUS_DELETED: 4,
  FILE_STATUS_RESERVED: 5,
} as const;

export const ScanStatus = {
  SCAN_STATUS_UNSPECIFIED: 0,
  SCAN_STATUS_AWAITING_UPLOAD: 1,
  SCAN_STATUS_SCANNING: 2,
  SCAN_STATUS_CLEAN: 3,
  SCAN_STATUS_REJECTED: 4,
} as const;

export const ValidationMode = {
  VALIDATION_MODE_UNSPECIFIED: 0,
  VALIDATION_MODE_SYNC: 1,
  VALIDATION_MODE_ASYNC: 2,
} as const;

export const RejectionReason = {
  REJECTION_REASON_UNSPECIFIED: 0,
  REJECTION_REASON_SIZE_MISMATCH: 1,
  REJECTION_REASON_MIME_MISMATCH: 2,
  REJECTION_REASON_MALWARE: 3,
  REJECTION_REASON_UNDECODABLE: 4,
  REJECTION_REASON_SCAN_TIMEOUT: 5,
} as const;
