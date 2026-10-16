import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  EntityType,
  type FileMetadataDTO,
  type GenerateUploadUrlWebResponse,
} from '@volontariapp/contracts';
import { storageApi } from '@/api/storage/storage.api';
import { uploadToPresignedPost } from '@/api/storage/storage-upload';
import { describeFileInfo } from '../storage-debug.constants';
import type { DebugFile, DebugLogEntry, DebugStep } from '../storage-debug.types';

const hostOf = (url: string): string => /^https?:\/\/([^/]+)/i.exec(url)?.[1] ?? url;

const readSize = async (uri: string): Promise<number> => (await (await fetch(uri)).blob()).size;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useStorageDebug = () => {
  const [entityType, setEntityType] = useState<EntityType>(EntityType.ENTITY_TYPE_USER_AVATAR);
  const [file, setFile] = useState<DebugFile | null>(null);
  const [upload, setUpload] = useState<GenerateUploadUrlWebResponse | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileMetadataDTO | null>(null);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = useCallback((entry: Omit<DebugLogEntry, 'id'>): void => {
    setLogs((previous) => [
      ...previous,
      { ...entry, id: `${String(Date.now())}-${String(previous.length)}` },
    ]);
  }, []);

  const runStep = useCallback(
    async <T>(
      step: DebugStep,
      action: () => Promise<T>,
      describe: (result: T) => string,
    ): Promise<T | null> => {
      const startedAt = Date.now();
      try {
        const result = await action();
        addLog({
          step,
          status: 'ok',
          message: describe(result),
          durationMs: Date.now() - startedAt,
        });
        return result;
      } catch (error) {
        addLog({
          step,
          status: 'error',
          message: errorMessage(error),
          durationMs: Date.now() - startedAt,
        });
        return null;
      }
    },
    [addLog],
  );

  const pickImage = useCallback(async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
      addLog({
        step: 'pick',
        status: 'error',
        message: 'Permission photos refusée',
        durationMs: 0,
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset === undefined) {
      return;
    }
    const picked = await runStep(
      'pick',
      async (): Promise<DebugFile> => ({
        uri: asset.uri,
        name: asset.fileName ?? `debug-${String(Date.now())}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
        sizeBytes: asset.fileSize ?? (await readSize(asset.uri)),
        width: asset.width,
        height: asset.height,
      }),
      (value) => `${value.name} (${String(Math.round(value.sizeBytes / 1024))} Ko, ${value.type})`,
    );
    if (picked !== null) {
      setFile(picked);
      setUpload(null);
      setIsUploaded(false);
      setFileInfo(null);
    }
  }, [addLog, runStep]);

  const declare = useCallback(
    async (target: DebugFile): Promise<GenerateUploadUrlWebResponse | null> => {
      const response = await runStep(
        'url',
        () =>
          storageApi.getUploadUrl({
            mimeType: target.type,
            sizeBytes: target.sizeBytes,
            entityType,
          }),
        (value) =>
          `fichier ${value.fileId.slice(0, 8)}, hôte ${hostOf(value.uploadUrl)}, champs signés : ${Object.keys(value.uploadFields).join(', ')}`,
      );
      if (response !== null) {
        setUpload(response);
        setIsUploaded(false);
        setFileInfo(null);
      }
      return response;
    },
    [entityType, runStep],
  );

  const send = useCallback(
    async (target: GenerateUploadUrlWebResponse, source: DebugFile): Promise<boolean> => {
      const sent = await runStep(
        'upload',
        async () => {
          await uploadToPresignedPost(target, {
            uri: source.uri,
            name: source.name,
            type: source.type,
          });
          return true;
        },
        () => 'fichier accepté par le stockage (quarantaine)',
      );
      setIsUploaded(sent === true);
      return sent === true;
    },
    [runStep],
  );

  const confirmFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      const response = await runStep(
        'confirm',
        () => storageApi.confirmUpload(fileId),
        (value) => describeFileInfo(value.file),
      );
      if (response !== null) {
        setFileInfo(response.file);
      }
      return response !== null;
    },
    [runStep],
  );

  const readMetadata = useCallback(
    async (fileId: string): Promise<boolean> => {
      const response = await runStep(
        'metadata',
        () => storageApi.getFileMetadata(fileId),
        (value) => describeFileInfo(value.file),
      );
      if (response !== null) {
        setFileInfo(response.file);
      }
      return response !== null;
    },
    [runStep],
  );

  const requestUrl = useCallback(async (): Promise<void> => {
    if (file !== null) {
      await declare(file);
    }
  }, [file, declare]);

  const sendFile = useCallback(async (): Promise<void> => {
    if (file !== null && upload !== null) {
      await send(upload, file);
    }
  }, [file, upload, send]);

  const confirm = useCallback(async (): Promise<void> => {
    if (upload !== null) {
      await confirmFile(upload.fileId);
    }
  }, [upload, confirmFile]);

  const refreshMetadata = useCallback(async (): Promise<void> => {
    if (upload !== null) {
      await readMetadata(upload.fileId);
    }
  }, [upload, readMetadata]);

  const runAll = useCallback(async (): Promise<void> => {
    if (file === null) {
      return;
    }
    setIsRunning(true);
    try {
      const declared = await declare(file);
      if (declared === null || !(await send(declared, file))) {
        return;
      }
      if (await confirmFile(declared.fileId)) {
        await readMetadata(declared.fileId);
      }
    } finally {
      setIsRunning(false);
    }
  }, [file, declare, send, confirmFile, readMetadata]);

  const clearLogs = useCallback((): void => {
    setLogs([]);
  }, []);

  return {
    entityType,
    setEntityType,
    file,
    upload,
    isUploaded,
    fileInfo,
    logs,
    isRunning,
    pickImage,
    requestUrl,
    sendFile,
    confirm,
    readMetadata: refreshMetadata,
    runAll,
    clearLogs,
  };
};
