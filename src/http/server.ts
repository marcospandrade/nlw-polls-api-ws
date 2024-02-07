import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = fastify();

const prisma = new PrismaClient();

app.post("/polls", async (request, reply) => {
  const pollSchema = z.object({
    title: z.string(),
  });

  const { title } = pollSchema.parse(request.body);

  const newPoll = await prisma.poll.create({
    data: {
      title,
    },
  });

  return reply.code(201).send({ pollId: newPoll.id });
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running");
});
