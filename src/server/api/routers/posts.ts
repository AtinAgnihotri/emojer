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
      orderBy: {
        createdAt: "desc",
      },
    });

    return await addUsersDataToPosts(posts);
  }),

  getByAuthorId: publicProcedure
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

  getByPostID: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
      });

      if (!post)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Can't find post with id ${input.postId}`,
        });

      const [postWithUserData] = await addUsersDataToPosts([post]);
      return postWithUserData;
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
