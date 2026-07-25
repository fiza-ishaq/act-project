import mammoth from 'mammoth';

export interface ParsedFileResult {
  fileName: string;
  fileType: string; // 'pdf' | 'docx' | 'image' | 'text';
  mimeType: string;
  extractedText: string;
  base64Data?: string; // Data URL or raw base64
  fileSizeFormatted: string;
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const mimeType = file.type || getMimeTypeFromExtension(fileName);
  const fileSizeFormatted = formatBytes(file.size);

  // 1. Text / Markdown files
  if (mimeType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await readFileAsText(file);
    return {
      fileName,
      fileType: 'text',
      mimeType: 'text/plain',
      extractedText: text,
      fileSizeFormatted
    };
  }

  // 2. Word .docx files
  if (
    fileName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      return {
        fileName,
        fileType: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extractedText: result.value || `[Document: ${fileName}]`,
        fileSizeFormatted
      };
    } catch (err) {
      console.warn("Mammoth docx parse fallback:", err);
      // Fallback base64
      const base64 = await readFileAsDataURL(file);
      return {
        fileName,
        fileType: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extractedText: `[Uploaded DOCX Document: ${fileName}]`,
        base64Data: base64,
        fileSizeFormatted
      };
    }
  }

  // 3. PDF Files (Supported natively by Gemini Vision/Multimodal API)
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const base64Data = await readFileAsDataURL(file);
    let extractedText = `[Uploaded PDF Resume Document: ${fileName}]`;

    return {
      fileName,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      extractedText,
      base64Data,
      fileSizeFormatted
    };
  }

  // 4. Image Files (PNG, JPG, JPEG, WEBP)
  if (
    mimeType.startsWith('image/') ||
    /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName)
  ) {
    const base64Data = await readFileAsDataURL(file);
    return {
      fileName,
      fileType: 'image',
      mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
      extractedText: `[Uploaded Resume Image / Scan: ${fileName}]`,
      base64Data,
      fileSizeFormatted
    };
  }

  // Default fallback
  const text = await readFileAsText(file);
  return {
    fileName,
    fileType: 'text',
    mimeType: 'text/plain',
    extractedText: text,
    fileSizeFormatted
  };
}

// Helpers
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'txt':
    case 'md': return 'text/plain';
    default: return 'application/octet-stream';
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as ArrayBuffer));
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
