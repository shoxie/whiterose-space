import Link from "next/link";

const Tags = ({ content, count }: { content: string; count?: number }) => {
  return (
    <Link
      href={`/tag/${content}`}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-highlightHigh px-3 py-1 text-sm text-subtle transition-colors duration-200 hover:border-love hover:text-love"
    >
      {content}
      {count !== undefined && (
        <span className="text-xs opacity-75" aria-label={`${count} bài viết`}>
          {count}
        </span>
      )}
    </Link>
  );
};

export default Tags;
