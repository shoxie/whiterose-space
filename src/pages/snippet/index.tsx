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
        <div className="border-b border-highlightHigh pb-8 mb-10">
          <p className="mb-2 text-xs tracking-[0.5em] text-love">コード</p>
          <h1 className="font-display text-4xl font-black tracking-tight text-text md:text-6xl">
            Snippets
          </h1>
          <p className="mt-3 text-subtle">
            Những đoạn code nhỏ mà tôi muốn giữ lại.
          </p>
        </div>
        <SnippetList snippets={snippets} />
        <div className="pt-10 mt-10 border-t border-highlightHigh">
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