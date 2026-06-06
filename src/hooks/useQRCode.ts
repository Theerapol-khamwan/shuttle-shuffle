/**
 * useQRCode — Hook สำหรับ generate QR Code เป็น data URI
 * ใช้ qrcode library แบบ async เพื่อไม่ block UI
 */

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

interface UseQRCodeResult {
  dataUri: string | null;
  loading: boolean;
  error: string | null;
  regenerate: (url: string) => void;
}

/**
 * @param url - URL ที่จะ encode เป็น QR Code
 * @returns dataUri, loading, error states
 */
export const useQRCode = (url: string | null): UseQRCodeResult => {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      const uri = await QRCode.toDataURL(targetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1c1b1b',   // Grip Tape Black
          light: '#fcf9f8',  // Court Chalk
        },
        errorCorrectionLevel: 'M',
      });
      setDataUri(uri);
    } catch (err) {
      console.error('[useQRCode] Error generating QR:', err);
      setError('ไม่สามารถสร้าง QR Code ได้');
      setDataUri(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (url) {
      generate(url);
    } else {
      setDataUri(null);
    }
  }, [url, generate]);

  return {
    dataUri,
    loading,
    error,
    regenerate: generate,
  };
};
