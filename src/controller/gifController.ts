import { FastifyRequest, FastifyReply } from "fastify";
import { GifService } from "../services/gifServices";
import fs from "fs";

const gifService = new GifService();

export class GifController {
  async generate(req: FastifyRequest, reply: FastifyReply) {
    try {
      // Obtém o arquivo enviado
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: "Nenhum arquivo enviado" });
      }

      // Converte o vídeo para GIF
      const gifPath = await gifService.generate(data);

      // Lê o GIF gerado e retorna como resposta
      const gifBuffer = fs.readFileSync(gifPath);
      reply.header("Content-Type", "image/gif");
      reply.header("Content-Disposition", `attachment; filename=output.gif`);

      // Apaga o arquivo temporário
      fs.unlinkSync(gifPath);

      return reply.send(gifBuffer);
    } catch (error) {
      console.error("Erro ao gerar GIF:", error);
      return reply.status(500).send({ error: "Erro ao processar o vídeo" });
    }
  }
}
