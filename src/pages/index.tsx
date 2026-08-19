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
