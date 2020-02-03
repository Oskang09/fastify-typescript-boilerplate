import * as admin from 'firebase-admin';

export default async function () {
    if (!process.env.FIREBASE_CREDENTIAL) {
        console.error("Missing 'FIREBASE_CREDENTIAL' environment variables.")
        process.exit();
    }

    const app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIAL))
    });
    return app
};