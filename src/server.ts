import fastify from "fastify";
import cors from "@fastify/cors"
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";


import fs from "fs";
import path from "path";


import { routes } from "./routes";

dotenv.config();

const app = fastify({ logger: true });
const start = async () => {
  await app.register(cors);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Ajustes de timeout do servidor (não resolvem limites do provedor, mas evitam cortes locais)
  // 0 = sem timeout para requestTimeout
  // Use variáveis de ambiente para ajustar em produção se necessário
  try {
    const reqTimeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 0);
    const hdrTimeout = Number(process.env.HEADERS_TIMEOUT_MS ?? 120000); // 120s
    const kaTimeout = Number(process.env.KEEPALIVE_TIMEOUT_MS ?? 120000); // 120s
    // @ts-ignore: propriedades válidas no http.Server
    app.server.requestTimeout = reqTimeout;
    // @ts-ignore
    app.server.headersTimeout = hdrTimeout;
    // @ts-ignore
    app.server.keepAliveTimeout = kaTimeout;
  } catch {}

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }


  await app.register(routes);


  try {
    await app.listen({ port: 3333, host: '0.0.0.0' });

  } catch (err) {
    app.log.error(err);
  }
}

start();