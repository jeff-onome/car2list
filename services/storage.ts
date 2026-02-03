
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apfuzwpathjdkkeixnse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZnV6d3BhdGhqZGtrZWl4bnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjk0MTIsImV4cCI6MjA3NTcwNTQxMn0.KCnY2TYbXPVaco21-1adK0Gp2N6DGq64BTPf2ZsZM-8';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const storageService = {
  /**
   * Uploads a File object to Supabase storage.
   */
  async uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Upload Error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Helper to convert base64 to Blob for Supabase upload if needed.
   */
  async uploadBase64Image(base64: string, name: string = 'image.png'): Promise<string | null> {
    try {
      const response = await fetch(base64);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      return await this.uploadImage(file);
    } catch (e) {
      console.error('Base64 Upload Error:', e);
      return null;
    }
  }
};
