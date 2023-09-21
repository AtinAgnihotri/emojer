import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Post } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import React from "react";

import { RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
dayjs.extend(relativeTime);

const UserImage: React.FC<{ url: string; userName: string | null }> = ({
  url,
  userName,
}) => {
  if (!url) return null;
  return (
    <Image
      src={url}
      alt={`${userName}-profile-image`}
      className="h-16 w-16 rounded-full"
      width="64"
      height="64"
    />
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  console.log("USER ID", user.id);

  return (
    <div className="flex w-full gap-3">
      <UserImage url={user.imageUrl} userName={user.username} />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView: React.FC<PostWithUser> = ({ post, author }) => {
  return (
    <div className="flex flex-row items-center border-b border-slate-400 p-8 ">
      <UserImage url={author.profilePicture} userName={author.name} />
      <div className="flex flex-col pl-4">
        <div className="flex gap-1">
          <span>@{author.name}</span>
          <span>{`· ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="">{post.content}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading . . . </div>;

  if (!data) return <div>Something Went Wrong!</div>;

  return (
    <>
      <Head>
        <title>Emojer</title>
        <meta name="description" content="Emojer (Dead Bird Clone)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div
            className={`flex ${
              user.isSignedIn ? "justify-between" : "justify-center"
            } border-b border-slate-400 p-4`}
          >
            {!!user.isSignedIn && <CreatePostWizard />}
            {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
          </div>
          <div className="flex flex-col">
            {data?.map(({ post, author }) => (
              <PostView post={post} author={author} key={post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
