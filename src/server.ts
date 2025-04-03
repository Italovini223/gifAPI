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

  const tmpDir = path.join(__dirname, "../tmp");
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