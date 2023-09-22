import { clerkClient } from "@clerk/nextjs";
import { Post } from "@prisma/client";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { addUsersDataToPosts, ratelimit } from "~/server/helpers";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      //   where: {authorId: }
      orderBy: {
        createdAt: "desc",
      },
    });

    return await addUsersDataToPosts(posts);
  }),

  getPostsByAuthorId: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        take: 100,
        where: { authorId: input.authorId },
        orderBy: {
          createdAt: "desc",
        },
      });

      return await addUsersDataToPosts(posts);
    }),

  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUserId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Stop spamming damnit!",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
