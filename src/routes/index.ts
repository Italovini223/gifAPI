import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { gifRoutes } from "./gif.routes";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions){
  fastify.register(gifRoutes, { prefix: "/gif" });
}