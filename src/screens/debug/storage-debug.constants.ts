import {
  EntityType,
  RejectionReason,
  ScanStatus,
  ValidationMode,
  type FileMetadataDTO,
} from '@volontariapp/contracts';
import type { DebugStep } from './storage-debug.types';

export const ENTITY_OPTIONS = [
  { label: 'Avatar', value: EntityType.ENTITY_TYPE_USER_AVATAR },
  { label: 'Post', value: EntityType.ENTITY_TYPE_POST },
  { label: 'Cover événement', value: EntityType.ENTITY_TYPE_EVENT_COVER },
  { label: 'Badge', value: EntityType.ENTITY_TYPE_BADGE_ICON },
] as const;

export const STEP_LABELS: Record<DebugStep, string> = {
  pick: 'Image',
  url: 'URL présignée',
  upload: 'Envoi S3',
  confirm: 'Confirmation',
  metadata: 'Métadonnées',
};

const SCAN_STATUS_LABELS: Partial<Record<number, string>> = {
  [ScanStatus.SCAN_STATUS_AWAITING_UPLOAD]: 'AWAITING_UPLOAD',
  [ScanStatus.SCAN_STATUS_SCANNING]: 'SCANNING',
  [ScanStatus.SCAN_STATUS_CLEAN]: 'CLEAN',
  [ScanStatus.SCAN_STATUS_REJECTED]: 'REJECTED',
};

const VALIDATION_MODE_LABELS: Partial<Record<number, string>> = {
  [ValidationMode.VALIDATION_MODE_SYNC]: 'SYNC',
  [ValidationMode.VALIDATION_MODE_ASYNC]: 'ASYNC',
};

const REJECTION_LABELS: Partial<Record<number, string>> = {
  [RejectionReason.REJECTION_REASON_SIZE_MISMATCH]: 'SIZE_MISMATCH',
  [RejectionReason.REJECTION_REASON_MIME_MISMATCH]: 'MIME_MISMATCH',
  [RejectionReason.REJECTION_REASON_MALWARE]: 'MALWARE',
  [RejectionReason.REJECTION_REASON_UNDECODABLE]: 'UNDECODABLE',
  [RejectionReason.REJECTION_REASON_SCAN_TIMEOUT]: 'SCAN_TIMEOUT',
};

/**
 * La gateway serialise les enums en noms ("SCAN_STATUS_CLEAN", loader gRPC `enums: String`),
 * alors que les types de contracts les declarent numeriques : on accepte les deux formes.
 */
const readable = (
  value: number | string,
  labels: Partial<Record<number, string>>,
  prefix: string,
): string =>
  typeof value === 'string' ? value.replace(prefix, '') : (labels[value] ?? String(value));

export const describeFileInfo = (file: FileMetadataDTO): string => {
  const scan = readable(file.scanStatus, SCAN_STATUS_LABELS, 'SCAN_STATUS_');
  const mode = readable(file.validationMode, VALIDATION_MODE_LABELS, 'VALIDATION_MODE_');
  const rejection =
    file.rejectionReason === undefined
      ? ''
      : `, rejet ${readable(file.rejectionReason, REJECTION_LABELS, 'REJECTION_REASON_')}`;
  const publicUrl = file.publicUrl === undefined ? 'URL publique absente' : 'URL publique présente';
  return `scan ${scan}, mode ${mode}${rejection}, ${publicUrl}`;
};
