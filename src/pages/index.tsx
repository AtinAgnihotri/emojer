import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import React, { useState } from "react";

import { api } from "~/utils/api";
import { toast } from "react-hot-toast";

import { UserImage } from "~/components/Profile";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import Layout from "~/components/Layout";
import { PostsFeed } from "~/components/Posts";

const CreatePostWizard = () => {
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { user } = useUser();
  const { mutate, isLoading } = api.posts.createPost.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMsgs = e.data?.zodError?.fieldErrors.content;
      toast.error(errorMsgs?.[0] ?? "Failed to Emojee! Please try again later");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <UserImage url={user.imageUrl} userName={user.username} />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => {
          e.preventDefault();
          setInput(e.target.value);
        }}
        onKeyDown={(e) => {
          e.preventDefault();
          if (e.key !== "Enter") return;
          if (input === "") return;
          mutate({ content: input });
        }}
        disabled={isLoading}
      />
      {input !== "" && !isLoading && (
        <button
          onClick={() => {
            mutate({ content: input });
          }}
          disabled={isLoading}
        >
          {isLoading ? "Posting" : "Post"}
        </button>
      )}
      {isLoading && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const user = useUser();

  if (!user.isLoaded) return <LoadingPage />;

  return (
    <Layout>
      <div
        className={`flex ${
          user.isSignedIn ? "justify-between" : "justify-center"
        } border-b border-slate-400 p-4`}
      >
        {!!user.isSignedIn && <CreatePostWizard />}
        {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
      </div>
      {!!user.isSignedIn && <PostsFeed />}
    </Layout>
  );
}
