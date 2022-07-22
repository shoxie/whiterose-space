import moment from "moment";
import { allPosts, Post } from ".contentlayer/generated";
import { pick } from "contentlayer/utils";
import PagesLayout from "@/layouts/Pages";
import { NextSeo } from "next-seo";
import BlogList from "@/modules/Blog/components/BlogList";

export default function BlogPage({ posts }: { posts: Post[] }) {
  return (
    <>
      <NextSeo title="Blog" description="All of the blog on this website." />
      <PagesLayout>
        <BlogList posts={posts} />
      </PagesLayout>
    </>
  );
}

export async function getStaticProps() {
  const posts = allPosts
    .filter((post) => post.draft !== true)
    .map((blog) => pick(blog, ["slug", "title", "summary", "date", "tags"]))
    .sort((a, b) => moment(b.date).diff(moment(a.date)));

  return { props: { posts } };
}
