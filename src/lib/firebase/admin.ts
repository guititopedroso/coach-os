import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";
import fs from "fs";

function createAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // 1. Tentar carregar via variável de ambiente Base64 (Solução para Hostinger/Produção)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const jsonStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(jsonStr);
      // Garantir que as quebras de linha da chave privada são corrigidas
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Erro ao decodificar FIREBASE_SERVICE_ACCOUNT_JSON:", e);
    }
  }

  // 2. Tentar carregar via ficheiro local (Solução para desenvolvimento local)
  const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Erro ao carregar firebase-service-account.json local:", e);
    }
  }

  // 3. Fallback manual (Variáveis individuais)
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminApp = createAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
