import { Snippet } from ".contentlayer/generated";
import moment from "moment";
import Link from "next/link";

const PostPreview = ({ snippet }: { snippet: Snippet }) => {
  return (
    <article className="card">
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <time className="card__tag !mb-0" dateTime={snippet.date}>
          {moment(snippet.date).format("LL")}
        </time>
      </div>
      <h3 className="mt-3">
        <Link
          href={`/snippet/${snippet.slug}`}
          className="transition-colors duration-300 hover:text-[var(--accent)]"
        >
          {snippet.title}
        </Link>
      </h3>
      <p className="text-[14px] leading-[1.7] text-[var(--muted)]">
        {snippet.description}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {snippet.tags?.map((tag) => (
          <Link key={tag} href={`/tag/${tag}`} className="chip !py-1.5">
            {tag}
            <i>→</i>
          </Link>
        ))}
      </div>
    </article>
  );
};

export default PostPreview;
