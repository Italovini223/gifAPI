import { FastifyRequest, FastifyReply } from "fastify";
import { GifService } from "../services/gifServices";

const gifService = new GifService();

export class GifController {
  async generate(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.isMultipart()) {
        console.warn("⚠️ Content-Type não é multipart/form-data:", req.headers["content-type"]);
        return reply.status(400).send({ error: "Content-Type deve ser multipart/form-data" });
      }

      // Consome o multipart inteiro garantindo que o stream do arquivo seja lido
      const parts = req.parts();
      let app: string | undefined;
      let empresaIdRaw: string | undefined;
      let videoBuffer: Buffer | undefined;
      let videoFilename: string | undefined;

      for await (const part of parts) {
        if (part.type === 'field') {
          if (part.fieldname === 'app') app = part.value as string;
          if (part.fieldname === 'empresa_id') empresaIdRaw = part.value as string;
        } else if (part.type === 'file') {
          if (!videoBuffer) {
            try {
              videoBuffer = await (part as any).toBuffer();
              videoFilename = (part as any).filename;
            } catch (e) {
              console.error("❌ Erro ao ler arquivo do multipart:", e);
              return reply.status(400).send({ error: "Erro ao ler arquivo enviado" });
            }
          } else {
            // drenar arquivos extras
            try { await (part as any).toBuffer(); } catch {}
          }
        }
      }
      if (!videoBuffer || !videoFilename) {
        return reply.status(400).send({ error: "Nenhum arquivo de vídeo enviado" });
      }
      if (!app) {
        return reply.status(400).send({ error: "Campo 'app' é obrigatório" });
      }
      if (!empresaIdRaw) {
        return reply.status(400).send({ error: "Campo 'empresa_id' é obrigatório" });
      }
      if (!/^\d+$/.test(empresaIdRaw)) {
        return reply.status(400).send({ error: "'empresa_id' deve conter apenas dígitos" });
      }

      let empresaId: bigint;
      try {
        empresaId = BigInt(empresaIdRaw);
      } catch {
        return reply.status(400).send({ error: "Valor inválido para 'empresa_id'" });
      }

      const gifUrl = await gifService.generate({ filename: videoFilename, buffer: videoBuffer }, app, empresaId);

      return reply.send({ gifUrl });
    } catch (error) {
      console.error("Erro ao gerar GIF:", error);
      return reply.status(500).send({ error: "Erro ao processar o vídeo" });
    }
  }
}
