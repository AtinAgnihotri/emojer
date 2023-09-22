import type { User } from "@clerk/nextjs/dist/types/server";
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
