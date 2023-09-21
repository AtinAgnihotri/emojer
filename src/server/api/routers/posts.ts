import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return { id: user.id, name: user.username, profilePicture: user.imageUrl };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      //   where: {authorId: }
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
});
