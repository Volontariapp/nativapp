import * as mockContracts from './contracts.mock';
import { toUploadState } from '../storage-status';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });

describe('toUploadState', () => {
  it.each([
    [mockContracts.ScanStatus.SCAN_STATUS_CLEAN, 'CLEAN'],
    [mockContracts.ScanStatus.SCAN_STATUS_SCANNING, 'SCANNING'],
    [mockContracts.ScanStatus.SCAN_STATUS_REJECTED, 'REJECTED'],
    [mockContracts.ScanStatus.SCAN_STATUS_AWAITING_UPLOAD, 'AWAITING_UPLOAD'],
  ])('reads the numeric status %s as %s', (status, expected) => {
    expect(toUploadState(status)).toBe(expected);
  });

  it.each([
    ['SCAN_STATUS_CLEAN', 'CLEAN'],
    ['SCAN_STATUS_SCANNING', 'SCANNING'],
    ['SCAN_STATUS_REJECTED', 'REJECTED'],
  ])('reads the status sent by the gateway as a name, %s, as %s', (status, expected) => {
    // La gateway serialise les enums en noms alors que contracts les type en nombres.
    expect(toUploadState(status)).toBe(expected);
  });

  it('does not take an unknown status for a clean file', () => {
    expect(toUploadState(mockContracts.ScanStatus.SCAN_STATUS_UNSPECIFIED)).toBe('UNKNOWN');
    expect(toUploadState('SCAN_STATUS_SOMETHING_NEW')).toBe('UNKNOWN');
  });
});
