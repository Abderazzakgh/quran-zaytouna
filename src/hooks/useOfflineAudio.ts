import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

const DB_NAME = 'QuranAudioDB';
const STORE_NAME = 'recitations';
const DB_VERSION = 1;

interface DownloadedRecitation {
  id: string;
  reciterId: string;
  reciterName: string;
  surahId: number;
  surahName: string;
  audioBlob: Blob;
  downloadedAt: Date;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('reciterId', 'reciterId', { unique: false });
        store.createIndex('surahId', 'surahId', { unique: false });
      }
    };
  });
};

export const useOfflineAudio = () => {
  const [downloadedRecitations, setDownloadedRecitations] = useState<Map<string, DownloadedRecitation>>(new Map());
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [bulkDownloadState, setBulkDownloadState] = useState<{
    isActive: boolean;
    reciterId: string | null;
    totalSurahs: number;
    completedSurahs: number;
    currentSurah: string;
    isPaused: boolean;
  }>({
    isActive: false,
    reciterId: null,
    totalSurahs: 0,
    completedSurahs: 0,
    currentSurah: '',
    isPaused: false
  });

  const getRecitationKey = (reciterId: string, surahId: number) => `${reciterId}_${surahId}`;

  const loadDownloadedRecitations = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const recitations = request.result as DownloadedRecitation[];
        const map = new Map<string, DownloadedRecitation>();
        recitations.forEach(r => map.set(r.id, r));
        setDownloadedRecitations(map);
      };
    } catch (error) {
      console.error('Failed to load downloaded recitations:', error);
    }
  }, []);

  useEffect(() => {
    loadDownloadedRecitations();
  }, [loadDownloadedRecitations]);

  const downloadRecitation = async (
    reciterId: string,
    reciterName: string,
    surahId: number,
    surahName: string,
    audioUrl: string
  ): Promise<boolean> => {
    const key = getRecitationKey(reciterId, surahId);

    if (downloadedRecitations.has(key)) {
      return true;
    }

    setIsDownloading(key);
    setDownloadProgress(0);

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const chunks: ArrayBuffer[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
        received += value.length;

        if (total > 0) {
          setDownloadProgress(Math.round((received / total) * 100));
        }
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });

      const recitation: DownloadedRecitation = {
        id: key,
        reciterId,
        reciterName,
        surahId,
        surahName,
        audioBlob: blob,
        downloadedAt: new Date()
      };

      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(recitation);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setDownloadedRecitations(prev => new Map(prev).set(key, recitation));
      setIsDownloading(null);
      setDownloadProgress(0);

      return true;
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(null);
      setDownloadProgress(0);
      return false;
    }
  };

  const bulkDownloadSurahs = async (
    reciterId: string,
    reciterName: string,
    surahsList: Array<{ id: number; name: string }>,
    getAudioUrl: (reciterId: string, surahId: number) => string
  ): Promise<void> => {
    const surahsToDownload = surahsList.filter(
      surah => !downloadedRecitations.has(getRecitationKey(reciterId, surah.id))
    );

    if (surahsToDownload.length === 0) {
      return;
    }

    setBulkDownloadState({
      isActive: true,
      reciterId,
      totalSurahs: surahsToDownload.length,
      completedSurahs: 0,
      currentSurah: surahsToDownload[0].name,
      isPaused: false
    });

    for (let i = 0; i < surahsToDownload.length; i++) {
      // Check if paused or cancelled
      if (bulkDownloadState.isPaused) {
        await new Promise<void>(resolve => {
          const checkPause = setInterval(() => {
            if (!bulkDownloadState.isPaused) {
              clearInterval(checkPause);
              resolve();
            }
          }, 500);
        });
      }

      const surah = surahsToDownload[i];
      const audioUrl = getAudioUrl(reciterId, surah.id);

      setBulkDownloadState(prev => ({
        ...prev,
        currentSurah: surah.name,
        completedSurahs: i
      }));

      try {
        await downloadRecitation(reciterId, reciterName, surah.id, surah.name, audioUrl);
      } catch (error) {
        console.error(`Failed to download surah ${surah.name}:`, error);
      }

      setBulkDownloadState(prev => ({
        ...prev,
        completedSurahs: i + 1
      }));
    }

    setBulkDownloadState({
      isActive: false,
      reciterId: null,
      totalSurahs: 0,
      completedSurahs: 0,
      currentSurah: '',
      isPaused: false
    });
  };

  const cancelBulkDownload = () => {
    setBulkDownloadState({
      isActive: false,
      reciterId: null,
      totalSurahs: 0,
      completedSurahs: 0,
      currentSurah: '',
      isPaused: false
    });
  };

  const getDownloadedCountForReciter = useCallback((reciterId: string): number => {
    let count = 0;
    downloadedRecitations.forEach((_, key) => {
      if (key.startsWith(reciterId + '_')) {
        count++;
      }
    });
    return count;
  }, [downloadedRecitations]);

  const getOfflineAudioUrl = useCallback((reciterId: string, surahId: number): string | null => {
    const key = getRecitationKey(reciterId, surahId);
    const recitation = downloadedRecitations.get(key);

    if (recitation) {
      return URL.createObjectURL(recitation.audioBlob);
    }

    return null;
  }, [downloadedRecitations]);

  const isDownloaded = useCallback((reciterId: string, surahId: number): boolean => {
    const key = getRecitationKey(reciterId, surahId);
    return downloadedRecitations.has(key);
  }, [downloadedRecitations]);

  const deleteRecitation = async (reciterId: string, surahId: number): Promise<boolean> => {
    const key = getRecitationKey(reciterId, surahId);

    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setDownloadedRecitations(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  };

  const getDownloadedList = useCallback(() => {
    return Array.from(downloadedRecitations.values());
  }, [downloadedRecitations]);

  const getTotalStorageSize = useCallback(() => {
    let total = 0;
    downloadedRecitations.forEach(r => {
      total += r.audioBlob.size;
    });
    return total;
  }, [downloadedRecitations]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAudioUrl = useCallback((reciterId: string, surahId: number) => {
    // 1. Check for offline file first
    const offlineUrl = getOfflineAudioUrl(reciterId, surahId);
    if (offlineUrl) return offlineUrl;

    // 2. Fallback to Supabase URL
    const surahNum = String(surahId).padStart(3, '0');
    const { data } = supabase.storage
      .from("quran-audio")
      .getPublicUrl(`reciters/${reciterId}/${surahNum}.mp3`);

    return data.publicUrl;
  }, [getOfflineAudioUrl]);

  return {
    downloadRecitation,
    getAudioUrl, // Added
    getOfflineAudioUrl,
    isDownloaded,
    deleteRecitation,
    getDownloadedList,
    getTotalStorageSize,
    formatFileSize,
    isDownloading,
    downloadProgress,
    bulkDownloadSurahs,
    bulkDownloadState,
    cancelBulkDownload,
    getDownloadedCountForReciter
  };
};
