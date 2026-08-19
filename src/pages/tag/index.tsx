
import { NextSeo } from "next-seo";
import React from "react";
import Tags from "@/common/Tags";
import PagesLayout from "@/layouts/Pages";
import { allTags, Tag } from "src/lib/tags";

export default function TagPage({ tags }: { tags: Tag[] }) {
  return (
    <PagesLayout>
        <div>
      <NextSeo title="Tags" description="All the blog's tag on this website." />
      <div className="border-b border-highlightHigh pb-5 mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.5em] text-love">札</p>
        <h1 className="font-display text-4xl font-black tracking-tight text-text md:text-6xl">
          Tags
        </h1>
      </div>
      <div className="flex flex-wrap gap-4 text-lg">
        {tags.map((tag) => (
          <Tags key={tag.name} content={tag.name} count={tag.count} />
        ))}
      </div>
    </div>
    </PagesLayout>
  );
}

export async function getStaticProps() {
  const tags = allTags().sort((a, b) => b.count - a.count);
  return {
    props: {
      tags,
    },
  };
}