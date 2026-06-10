import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

// State caches
let cachedAccessToken: string | null = null;
let googleUser: User | null = null;
let isAuthenticating = false;

// Subscriptions
const authListeners = new Set<(user: User | null, token: string | null) => void>();

export const DRIVE_FOLDER_ID = '1yKGSDjtsj3ldvxFxMCxNoOPjFo-Vm9JS';

export const subscribeToGoogleAuth = (listener: (user: User | null, token: string | null) => void) => {
  authListeners.add(listener);
  listener(googleUser, cachedAccessToken);
  return () => {
    authListeners.delete(listener);
  };
};

const notifyListeners = () => {
  authListeners.forEach((listener) => listener(googleUser, cachedAccessToken));
};

// Initializer
export const initGoogleAuth = () => {
  return onAuthStateChanged(auth, async (user) => {
    googleUser = user;
    if (!user) {
      cachedAccessToken = null;
    }
    notifyListeners();
  });
};

// Google Drive sign-in
export const connectGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isAuthenticating) return null;
  try {
    isAuthenticating = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token.');
    }
    cachedAccessToken = credential.accessToken;
    googleUser = result.user;
    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Drive connection error:', error);
    throw error;
  } finally {
    isAuthenticating = false;
  }
};

// Sign out
export const disconnectGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  googleUser = null;
  notifyListeners();
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const isGoogleConnected = (): boolean => {
  return !!cachedAccessToken && !!googleUser;
};

export const getGoogleUser = (): User | null => {
  return googleUser;
};

/**
 * Uploads a file to the specific Google Drive folder: 1yKGSDjtsj3ldvxFxMCxNoOPjFo-Vm9JS
 */
export const uploadFileToGoogleDrive = async (
  file: File | Blob,
  fileName: string,
  recordMetadata?: { applicant: string; title: string }
): Promise<{ fileId: string; webViewLink: string }> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Google Drive is not authenticated or connected. Please sign in to Google first.');
  }

  // Create descriptive file name
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'png';
  const timestamp = new Date().toISOString().slice(0, 10);
  const formattedTitle = recordMetadata 
    ? `${timestamp}_${recordMetadata.applicant.replace(/\s+/g, '_')}_${recordMetadata.title.replace(/\s+/g, '_')}.${extension}`
    : `${timestamp}_${fileName.replace(/\s+/g, '_')}`;

  const metadata = {
    name: formattedTitle,
    parents: [DRIVE_FOLDER_ID],
  };

  const boundary = '3d0f1d52';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  // Get file as array buffer
  const arrayBuffer = await file.arrayBuffer();
  const binaryContent = new Uint8Array(arrayBuffer);
  
  // Convert binary to base64 safely
  let binaryString = '';
  const chunkSize = 8192;
  for (let i = 0; i < binaryContent.length; i += chunkSize) {
    const chunk = binaryContent.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Data = btoa(binaryString);

  const contentType = file.type || 'application/octet-stream';
  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + contentType + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    close_delim;

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Drive Upload failure:', errorText);
    throw new Error(`Google Drive upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
};

/**
 * Downloads a file binary content from Google Drive and returns it as a Blob
 */
export const downloadFileFromGoogleDrive = async (fileId: string): Promise<Blob> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Google Drive is not authenticated or connected.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file from Google Drive: ${response.statusText}`);
  }

  return await response.blob();
};

/**
 * Utility to convert base64 data URL to Blob
 */
export const dataURLtoBlob = (dataurl: string): Blob => {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Failed to convert dataURL to Blob:', err);
    throw new Error('Invalid attachment format.');
  }
};

/**
 * Uploads a base64 encoded file to reference folder
 */
export const uploadBase64ToGoogleDrive = async (
  base64DataUrl: string,
  fileName: string,
  recordMetadata?: { applicant: string; title: string }
): Promise<{ fileId: string; webViewLink: string }> => {
  const blob = dataURLtoBlob(base64DataUrl);
  return uploadFileToGoogleDrive(blob, fileName, recordMetadata);
};

