import Link from "next/link";
import { NextSeo } from "next-seo";
import PagesLayout from "@/layouts/Pages";
import { allTags, Tag } from "src/lib/tags";

export default function TagPage({ tags }: { tags: Tag[] }) {
  return (
    <>
      <NextSeo title="Chủ đề" description="All the blog's tag on this website." />
      <PagesLayout>
        <header className="mb-12">
          <p className="secnum">03 — CHỦ ĐỀ</p>
          <h2 className="h2">
            Mọi <em>chủ đề</em> đã viết
          </h2>
          <p className="max-w-[62ch] text-[15px] leading-[1.75] text-[var(--muted)]">
            Tất cả các chủ đề trên blog, kèm số bài viết tương ứng.
          </p>
        </header>
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => (
            <Link key={tag.name} href={`/tag/${tag.name}`} className="chip">
              {tag.name}
              <i>{tag.count}</i>
            </Link>
          ))}
        </div>
      </PagesLayout>
    </>
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
