import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";
import fs from "fs";

function createAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      
      // REPARAÇÃO AUTOMÁTICA DE CHAVE PEM
      if (serviceAccount.private_key) {
        let key = serviceAccount.private_key.replace(/\\n/g, "\n");
        const parts = key.split("-----");
        if (parts.length >= 5) {
          const header = "-----" + parts[1] + "-----";
          const footer = "-----" + parts[3] + "-----";
          // Limpa tudo o que não seja base64 (espaços, tabs, \n)
          const body = parts[2].replace(/\s/g, "");
          // Reconstroi em blocos de 64 chars (padrão PEM)
          const bodyFormatted = body.match(/.{1,64}/g)?.join("\n");
          serviceAccount.private_key = `${header}\n${bodyFormatted}\n${footer}\n`;
        }
      }

      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Erro crítico ao carregar Firebase Admin:", e);
    }
  }

  // Fallback para variáveis de ambiente (útil para CI/CD que não permite ficheiros)
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
