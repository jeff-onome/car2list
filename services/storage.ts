
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apfuzwpathjdkkeixnse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZnV6d3BhdGhqZGtrZWl4bnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjk0MTIsImV4cCI6MjA3NTcwNTQxMn0.KCnY2TYbXPVaco21-1adK0Gp2N6DGq64BTPf2ZsZM-8';

export const supabase = createClient(supabaseUrl, supabaseKey);

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const storageService = {
  /**
   * Performs deep validation on a file before transmission.
   */
  async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // 1. Basic Type Check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Unauthorized file format. Only JPEG, PNG, and WEBP are permitted.' };
    }

    // 2. Size Check
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Asset exceeds security size limit (5MB).' };
    }

    // 3. Magic Number Check (Integrity Validation)
    const isValidHeader = await this.checkFileHeader(file);
    if (!isValidHeader) {
      return { valid: false, error: 'File integrity check failed. The digital signature does not match the file extension.' };
    }

    return { valid: true };
  },

  /**
   * Inspects the first few bytes of the file to verify it is actually an image.
   */
  async checkFileHeader(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return resolve(false);
        const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
        let header = "";
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        
        // Common headers: 
        // jpeg: ffd8ffe0, ffd8ffe1, ffd8ffe2, ffd8ffdb
        // png: 89504e47
        // webp: 52494646 (RIFF)
        const isJpeg = header.startsWith("ffd8ff");
        const isPng = header.startsWith("89504e47");
        const isWebp = header.startsWith("52494646");
        
        resolve(isJpeg || isPng || isWebp);
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  },

  /**
   * Uploads a File object with strict security controls.
   */
  async uploadImage(file: File): Promise<string | null> {
    const validation = await this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Sanitize filename: use UUID-like random string and strictly enforce sanitized extension
    const fileExt = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const safeFileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${safeFileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Explicitly set content type to prevent sniffing
      });

    if (error) {
      console.error('Supabase Security Upload Blocked:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Base64 conversion with validation.
   */
  async uploadBase64Image(base64: string, name: string = 'image.png'): Promise<string | null> {
    try {
      const response = await fetch(base64);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      return await this.uploadImage(file);
    } catch (e: any) {
      console.error('Secure Base64 Upload Error:', e);
      throw e;
    }
  }
};
