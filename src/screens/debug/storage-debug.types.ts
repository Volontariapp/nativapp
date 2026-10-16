export type DebugStep = 'pick' | 'url' | 'upload' | 'confirm' | 'metadata';

export type DebugLogStatus = 'ok' | 'error';

export interface DebugFile {
  uri: string;
  name: string;
  type: string;
  sizeBytes: number;
}

export interface DebugLogEntry {
  id: string;
  step: DebugStep;
  status: DebugLogStatus;
  message: string;
  durationMs: number;
}
