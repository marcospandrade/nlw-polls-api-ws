import z from "zod";

import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", async (request, reply) => {
    const pollSchema = z.object({
      title: z.string(),
      options: z.array(z.string()),
    });

    const { title, options } = pollSchema.parse(request.body);

    const newPoll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => ({ title: option })),
          },
        },
      },
    });

    return reply.code(201).send({ pollId: newPoll.id });
  });
}
