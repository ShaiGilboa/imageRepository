import * as admin from 'firebase-admin';
import cert from './firebase-cerdentials.json';
import firebaseConfig from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

const serviceAccount = cert as admin.ServiceAccount

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "image-repository-a.appspot.com",
})

const db = admin.firestore();
const storage = admin.storage().bucket();
// console.log('serviceAccount', serviceAccount)
const docRef = db.collection('users').doc('alovelace');

const upload = async (file : any) => {
  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuidv4()
    },
    // contentType: 'image/png',
    cacheControl: 'public, max-age=31536000',
  };

  // Uploads a local file to the bucket
  await storage.upload(file, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    metadata: metadata,
  });

console.log(`${file} uploaded.`);

}

upload('C:/Users/User/Pictures/Camera Roll/1.jpg').catch(console.error);

// const testing = async ()  => {
//   await docRef.set({
//     first: 'Ada',
//     last: 'Lovelace',
//     born: 1815
//   });
//   return;
// }

