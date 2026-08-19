import { Snippet } from ".contentlayer/generated";
import Tags from "@/common/Tags";
import moment from "moment";
import Link from "next/link";

const PostPreview = ({ snippet }: { snippet: Snippet }) => {
  return (
    <article className="group flex flex-col space-y-3 rounded-xl border border-highlightHigh bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-love/60 hover:shadow-[0_8px_30px_rgba(225,29,46,0.12)]">
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link
          href={`/snippet/${snippet.slug}`}
          className="font-display text-2xl font-bold text-text transition-colors duration-200 group-hover:text-love"
        >
          {snippet.title}
        </Link>
        <time dateTime={snippet.date} className="text-sm text-subtle">
          {moment(snippet.date).format("LL")}
        </time>
      </div>
      <p className="text-subtle">{snippet.description}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {snippet.tags?.map((tag) => (
          <Tags key={tag} content={tag} />
        ))}
      </div>
    </article>
  );
};

export default PostPreview;
