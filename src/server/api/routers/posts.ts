import { clerkClient } from "@clerk/nextjs";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient, ratelimit } from "~/server/helpers";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      //   where: {authorId: }
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((p) => p.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (!author || !author.name)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for Post not found",
        });

      return {
        post,
        author: {
          ...author,
          name: author.name,
        },
      };
    });
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

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((p) => p.authorId),
          limit: 100,
        })
      ).map(filterUserForClient);

      return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (!author || !author.name)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for Post not found",
          });

        return {
          post,
          author: {
            ...author,
            name: author.name,
          },
        };
      });
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
