import { FastifyRequest, FastifyReply } from "fastify";
import { GifService } from "../services/gifServices";

const gifService = new GifService();

export class GifController {
  async generate(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: "Nenhum arquivo enviado" });
      }

      const gifUrl = await gifService.generate(data);

      return reply.send({ gifUrl });
    } catch (error) {
      console.error("Erro ao gerar GIF:", error);
      return reply.status(500).send({ error: "Erro ao processar o vídeo" });
    }
  }
}
