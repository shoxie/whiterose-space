import { allPosts, allSnippets, Post, Snippet } from ".contentlayer/generated";
import { pick } from "@/lib/pick";
import moment from "moment";
import { NextSeo } from "next-seo";
import BlogList from "@/modules/Blog/components/BlogList";
import SnippetList from "@/modules/Snippet/components/SnippetList";
import { allTags } from "src/lib/tags";
import PagesLayout from "@/layouts/Pages";

export default function TagViewPage({
  posts,
  snippets,
  tagName,
}: {
  posts: Post[];
  snippets: Snippet[];
  tagName: string;
}) {
  return (
    <>
      <NextSeo
        title={tagName.toUpperCase()}
        description={`All the blog with ${tagName} tag`}
      />
      <PagesLayout>
        <header className="mb-12">
          <p className="secnum">CHỦ ĐỀ</p>
          <h2 className="h2">#{tagName}</h2>
          <p className="max-w-[62ch] text-[15px] leading-[1.75] text-[var(--muted)]">
            {posts.length + snippets.length} bài viết thuộc chủ đề này.
          </p>
        </header>
        {posts.length > 0 && (
          <section className="mb-14">
            <p className="secnum">Bài viết</p>
            <BlogList posts={posts} />
          </section>
        )}
        {snippets.length > 0 && (
          <section>
            <p className="secnum">Snippet</p>
            <SnippetList snippets={snippets} />
          </section>
        )}
      </PagesLayout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: allTags().map((tag) => ({
      params: { slug: tag.name },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const posts = allPosts
    .filter((post) => post.draft !== true && post.tags.includes(slug))
    .map((blog) => pick(blog, ["slug", "title", "summary", "date", "tags"]))
    .sort((a, b) => moment(b.date).diff(moment(a.date)));
  const snippets = allSnippets
    .filter((snippet) => snippet.tags.includes(slug))
    .map((snippet) =>
      pick(snippet, ["slug", "title", "description", "date", "tags"]),
    )
    .sort((a, b) => moment(b.date).diff(moment(a.date)));
  return { props: { posts, snippets, tagName: slug } };
}
