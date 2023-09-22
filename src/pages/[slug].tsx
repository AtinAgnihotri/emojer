import Head from "next/head";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import { UserImage } from "~/components/Profile";
import { UserPostsFeed } from "~/components/Posts";

type PageProps = { username: string };

const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>@{username}</title>
      </Head>
      <Layout>
        <div className="relative mb-10 flex h-28 flex-row items-center justify-end gap-3 border-b border-slate-400 bg-gradient-to-r from-slate-600 p-3">
          <UserImage
            url={data.profilePicture}
            userName={data.name}
            size={100}
            className="absolute bottom-0 left-0 -mb-12 ml-2 border-2 border-slate-400 drop-shadow-lg"
          />

          <div>@{data.name}</div>
        </div>
        <UserPostsFeed authorId={data.id} />
      </Layout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUserId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
