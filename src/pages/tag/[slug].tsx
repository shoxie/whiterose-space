import { allPosts, Post } from ".contentlayer/generated";
import { pick } from "@/lib/pick";
import moment from "moment";
import { NextSeo } from "next-seo";
import React from "react";
import BlogList from "@/modules/Blog/components/BlogList";
import { allTags } from "src/lib/tags";
import PagesLayout from "@/layouts/Pages";

export default function TagViewPage({
  posts,
  tagName,
}: {
  posts: Post[];
  tagName: string;
}) {
  return (
    <>
      <NextSeo
        title={tagName.toUpperCase()}
        description={`All the blog with ${tagName} tag`}
      />
      <PagesLayout>
        <BlogList posts={posts} />
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
  return { props: { posts, tagName: slug } };
}
