import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import React from "react";

import { RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserImage } from "~/components/Profile";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
dayjs.extend(relativeTime);

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

const PostsFeed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

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

export default function Home() {
  const user = useUser();

  if (!user.isLoaded) return <LoadingPage />;

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
          {!!user.isSignedIn && <PostsFeed />}
        </div>
      </main>
    </>
  );
}
