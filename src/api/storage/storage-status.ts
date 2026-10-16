import { ScanStatus } from '@volontariapp/contracts';

export type UploadState = 'CLEAN' | 'SCANNING' | 'REJECTED' | 'AWAITING_UPLOAD' | 'UNKNOWN';

const BY_NUMBER: Partial<Record<number, UploadState>> = {
  [ScanStatus.SCAN_STATUS_CLEAN]: 'CLEAN',
  [ScanStatus.SCAN_STATUS_SCANNING]: 'SCANNING',
  [ScanStatus.SCAN_STATUS_REJECTED]: 'REJECTED',
  [ScanStatus.SCAN_STATUS_AWAITING_UPLOAD]: 'AWAITING_UPLOAD',
};

const BY_NAME: Partial<Record<string, UploadState>> = {
  SCAN_STATUS_CLEAN: 'CLEAN',
  SCAN_STATUS_SCANNING: 'SCANNING',
  SCAN_STATUS_REJECTED: 'REJECTED',
  SCAN_STATUS_AWAITING_UPLOAD: 'AWAITING_UPLOAD',
};

/**
 * La gateway serialise les enums en noms ("SCAN_STATUS_CLEAN", loader gRPC `enums: String`)
 * alors que les types de contracts les déclarent numériques : on accepte les deux formes.
 * Un statut inconnu n'est jamais pris pour un fichier propre.
 */
export const toUploadState = (scanStatus: ScanStatus | string): UploadState =>
  (typeof scanStatus === 'string' ? BY_NAME[scanStatus] : BY_NUMBER[scanStatus]) ?? 'UNKNOWN';
