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
      <NextSeo title="Blog" description="All of the blog on this website." />
      <PagesLayout>
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