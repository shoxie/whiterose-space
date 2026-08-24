import { allSnippets, Snippet } from ".contentlayer/generated";
import { pick } from "@/lib/pick";
import TopTrackSpotify from "@/common/TopSpotify";
import PagesLayout from "@/layouts/Pages";
import moment from "moment";
import { NextSeo } from "next-seo";
import SnippetList from "@/modules/Snippet/components/SnippetList";

export default function BlogPage({ snippets }: { snippets: Snippet[] }) {
  return (
    <>
      <NextSeo
        title="Snippets"
        description="Những đoạn code nhỏ, tiện dụng."
      />
      <PagesLayout>
        <header className="mb-12">
          <p className="secnum">02 — SNIPPET</p>
          <h2 className="h2">
            Đoạn code <em>nhỏ</em>, tiện dụng
          </h2>
          <p className="max-w-[62ch] text-[15px] leading-[1.75] text-[var(--muted)]">
            Những đoạn code nhỏ mà tôi muốn giữ lại.
          </p>
        </header>
        <SnippetList snippets={snippets} />
        <div className="pt-10 mt-10 border-t border-[var(--line)]">
          <TopTrackSpotify />
        </div>
      </PagesLayout>
    </>
  );
}

export async function getStaticProps() {
  const snippets = allSnippets
    .map((snippet) =>
      pick(snippet, ["slug", "title", "date", "logo", "description", "tags"])
    )
    .sort((a, b) => moment(b.date).diff(moment(a.date)));

  return { props: { snippets } };
}