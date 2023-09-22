import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type FilteredUserResource = {
  id: string;
  name: string;
  profilePicture: string;
};

export const filterUserForClient = (user: User): FilteredUserResource => {
  return { id: user.id, name: user.username!, profilePicture: user.imageUrl };
};

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const addUsersDataToPosts = async (posts: Post[]) => {
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
};
