import { RouterOutputs, api } from "~/utils/api";
import { LoadingSpinner } from "./Loading";
import Link from "next/link";
import { UserImage } from "./Profile";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Post } from "@prisma/client";
import { FilteredUserResource } from "~/server/helpers";
import React from "react";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView: React.FC<PostWithUser> = ({ post, author }) => {
  const userSlug = `/@${author.name}`;
  const postSlug = `/post/${post.id}`;

  return (
    <div className="flex flex-row items-center border-b border-slate-400 p-8 ">
      <Link href={userSlug}>
        <UserImage url={author.profilePicture} userName={author.name} />
      </Link>
      <div className="flex flex-col pl-4">
        <div className="flex gap-1">
          <Link href={userSlug}>
            <span>@{author.name}</span>
          </Link>
          <Link href={postSlug}>
            <span>{`· ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="pt-1 text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

type TPostList = {
  data:
    | {
        post: Post;
        author: FilteredUserResource;
      }[]
    | undefined;
  isLoading: boolean;
};

const PostList: React.FC<TPostList> = ({ data, isLoading }) => {
  if (!data && !isLoading) return <div>Something Went Wrong!</div>;

  return (
    <div className="flex h-full flex-col">
      {isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      )}
      {data?.map(({ post, author }) => (
        <PostView post={post} author={author} key={post.id} />
      ))}
    </div>
  );
};

export const PostsFeed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

  return <PostList data={data} isLoading={isLoading} />;
};

type TUserPostsFeed = {
  authorId: string;
};

export const UserPostsFeed: React.FC<TUserPostsFeed> = ({ authorId }) => {
  const { data, isLoading } = api.posts.getPostsByAuthorId.useQuery({
    authorId,
  });

  return <PostList data={data} isLoading={isLoading} />;
};
