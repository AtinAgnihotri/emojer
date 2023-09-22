import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import { PostView } from "~/components/Posts";
import { generateSSGHelper } from "~/server/helpers";

type PageProps = { postId: string };

const PostPage: NextPage<PageProps> = ({ postId }) => {
  const { data } = api.posts.getByPostID.useQuery({
    postId,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.name}`}</title>
      </Head>
      <Layout>
        <PostView {...data} />
      </Layout>
    </>
  );
};

export default PostPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const postId = context.params?.id;

  if (typeof postId !== "string") throw new Error("no id");

  await ssg.posts.getByPostID.prefetch({ postId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
