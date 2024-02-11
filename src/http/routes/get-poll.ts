import { FastifyInstance } from "fastify";
import z from "zod";

import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";

export async function getPoll(app: FastifyInstance) {
  app.get("/polls/:pollId", async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    if (!poll) {
      return reply.status(400).send({ message: "Poll not found" });
    }

    const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

    const votes = result.reduce((prev, curr, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];

        Object.assign(prev, { [curr]: Number(score) });
      }

      return prev;
    }, {} as Record<string, number>);

    console.log(votes);

    return reply.send({
      poll: {
        ...poll,
        options: poll.options.map((option) => ({
          ...option,
          votes: votes[option.id] || 0,
        })),
      },
    });
  });
}
