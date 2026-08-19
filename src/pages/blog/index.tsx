import moment from "moment";
import { allPosts, Post } from ".contentlayer/generated";
import { pick } from "@/lib/pick";
import PagesLayout from "@/layouts/Pages";
import { NextSeo } from "next-seo";
import BlogList from "@/modules/Blog/components/BlogList";
import TopTrackSpotify from "@/common/TopSpotify";

export default function BlogPage({ posts }: { posts: Post[] }) {
  return (
    <>
      <NextSeo title="Blog" description="All of the blog on this website." />
      <PagesLayout>
        <div className="border-b border-highlightHigh pb-8 mb-10">
          <p className="mb-2 text-xs tracking-[0.5em] text-love">記事</p>
          <h1 className="font-display text-4xl font-black tracking-tight text-text md:text-6xl">
            Bài viết
          </h1>
          <p className="mt-3 text-subtle">
            Những bài viết về code, ServiceNow và mọi thứ linh tinh.
          </p>
        </div>
        <BlogList posts={posts} />
        <div className="pt-10 mt-10 border-t border-highlightHigh">
          <TopTrackSpotify />
        </div>
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
