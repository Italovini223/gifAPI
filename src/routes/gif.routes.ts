import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import  { GifController } from "../controller/gifController";

export async function gifRoutes(fastify: FastifyInstance, options: FastifyPluginOptions){
  const gifController = new GifController();

  fastify.post("/generate", async (req: FastifyRequest, reply: FastifyReply) => {
    await gifController.generate(req, reply);
  })
}