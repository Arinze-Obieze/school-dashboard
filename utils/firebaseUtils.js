import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';

export async function uploadToFirebaseStorage(file, userId) {
  if (!file) return '';
  
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${userId}/photo-${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    console.log('Uploading to Firebase Storage:', { fileName, fileSize: file.size, fileType: file.type });
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload completed:', snapshot);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage upload error:', error);
    throw new Error(`Photo upload failed: ${error.message}`);
  }
}