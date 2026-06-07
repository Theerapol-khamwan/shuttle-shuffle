/**
 * useQRCode — Hook สำหรับ generate QR Code เป็น data URI
 * ใช้ qrcode library แบบ core/async เพื่อไม่ block UI และไม่ใช้ canvas
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
 * แปลง Uint8Array เป็น Base64 string ใน pure JavaScript
 */
function uint8ToBase64(uint8: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = uint8.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = uint8[i];
    const b2 = i + 1 < len ? uint8[i + 1] : 0;
    const b3 = i + 2 < len ? uint8[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = i + 1 < len ? (((b2 & 15) << 2) | (b3 >> 6)) : 64;
    const enc4 = i + 2 < len ? (b3 & 63) : 64;

    result += chars[enc1] + chars[enc2] +
      (enc3 === 64 ? '=' : chars[enc3]) +
      (enc4 === 64 ? '=' : chars[enc4]);
  }
  return result;
}

/**
 * สร้างภาพ BMP (24-bit uncompressed) ของ QR Code จาก matrix data
 */
function generateBMP(size: number, qrData: Uint8Array, scale: number = 8, margin: number = 2): string {
  const sizeWithMargin = size + 2 * margin;
  const width = sizeWithMargin * scale;
  const height = sizeWithMargin * scale;
  const padding = (4 - (width * 3) % 4) % 4;
  const rowSize = width * 3 + padding;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new Uint8Array(fileSize);

  // File Header (14 bytes)
  buffer[0] = 0x42; // 'B'
  buffer[1] = 0x4d; // 'M'
  // File size
  buffer[2] = fileSize & 0xff;
  buffer[3] = (fileSize >> 8) & 0xff;
  buffer[4] = (fileSize >> 16) & 0xff;
  buffer[5] = (fileSize >> 24) & 0xff;
  // Reserved (0)
  buffer[6] = 0; buffer[7] = 0; buffer[8] = 0; buffer[9] = 0;
  // Offset to pixel data (54)
  buffer[10] = 54; buffer[11] = 0; buffer[12] = 0; buffer[13] = 0;

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  buffer[14] = 40; buffer[15] = 0; buffer[16] = 0; buffer[17] = 0; // Header size
  // Width
  buffer[18] = width & 0xff;
  buffer[19] = (width >> 8) & 0xff;
  buffer[20] = (width >> 16) & 0xff;
  buffer[21] = (width >> 24) & 0xff;
  // Height (positive for bottom-up)
  buffer[22] = height & 0xff;
  buffer[23] = (height >> 8) & 0xff;
  buffer[24] = (height >> 16) & 0xff;
  buffer[25] = (height >> 24) & 0xff;
  // Planes (1)
  buffer[26] = 1; buffer[27] = 0;
  // Bits per pixel (24)
  buffer[28] = 24; buffer[29] = 0;
  // Compression (0 = BI_RGB)
  buffer[30] = 0; buffer[31] = 0; buffer[32] = 0; buffer[33] = 0;
  // Image size (0 is fine)
  buffer[34] = 0; buffer[35] = 0; buffer[36] = 0; buffer[37] = 0;
  // Resolution (2835 = 72 DPI)
  buffer[38] = 0x13; buffer[39] = 0x0b; buffer[40] = 0; buffer[41] = 0;
  buffer[42] = 0x13; buffer[43] = 0x0b; buffer[44] = 0; buffer[45] = 0;
  // Colors (0)
  buffer[46] = 0; buffer[47] = 0; buffer[48] = 0; buffer[49] = 0;
  buffer[50] = 0; buffer[51] = 0; buffer[52] = 0; buffer[53] = 0;

  // Colors (BGR format):
  // Dark: #1c1b1b -> B: 0x1b, G: 0x1b, R: 0x1c
  // Light: #fcf9f8 -> B: 0xf8, G: 0xf9, R: 0xfc
  const darkB = 0x1b, darkG = 0x1b, darkR = 0x1c;
  const lightB = 0xf8, lightG = 0xf9, lightR = 0xfc;

  // Pixel data
  let offset = 54;
  for (let r = 0; r < height; r++) {
    const qrRow = (sizeWithMargin - 1) - Math.floor(r / scale) - margin;
    const isRowInMargin = qrRow < 0 || qrRow >= size;
    for (let c = 0; c < width; c++) {
      const qrCol = Math.floor(c / scale) - margin;
      const isColInMargin = qrCol < 0 || qrCol >= size;
      const isDark = !isRowInMargin && !isColInMargin && !!qrData[qrRow * size + qrCol];
      buffer[offset++] = isDark ? darkB : lightB;
      buffer[offset++] = isDark ? darkG : lightG;
      buffer[offset++] = isDark ? darkR : lightR;
    }
    // Row padding to be multiple of 4 bytes
    for (let p = 0; p < padding; p++) {
      buffer[offset++] = 0;
    }
  }

  return 'data:image/bmp;base64,' + uint8ToBase64(buffer);
}

/**
 * @param url - URL ที่จะ encode เป็น QR Code
 * @returns dataUri, loading, error states
 */
export const useQRCode = (url: string | null): UseQRCodeResult => {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback((targetUrl: string) => {
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      // ใช้ (QRCode as any).create เพื่อหลีกเลี่ยงข้อจำกัด type definition และไม่พึ่งพา HTML Canvas
      const qr = (QRCode as any).create(targetUrl, {
        errorCorrectionLevel: 'M',
      });
      
      const uri = generateBMP(qr.modules.size, qr.modules.data, 8, 2);
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
