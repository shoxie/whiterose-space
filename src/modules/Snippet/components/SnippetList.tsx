import { Snippet } from ".contentlayer/generated";
import { AiOutlineSearch } from "react-icons/ai";
import PostPreview from "./PostPreview";
import { useState, useMemo } from "react";
import { useDebouncedValue } from "@mantine/hooks";

const SnippetList = ({ snippets }: { snippets: Snippet[] }) => {
  const [search, setSearch] = useState("");
  const [debouncedValue] = useDebouncedValue(search, 200);

  const filteredPosts = useMemo(() => {
    if (debouncedValue === "") {
      return snippets;
    }
    return snippets.filter((post) =>
      post.title.toLowerCase().includes(debouncedValue.toLowerCase())
    );
  }, [snippets, debouncedValue]);

  return (
    <>
      <div className="flex w-full flex-col items-start space-y-4 pb-8">
        <p className="secnum !mb-0">Tổng cộng {snippets.length} snippets</p>
        <div className="relative w-full max-w-md">
          <label htmlFor="snippet-search" className="sr-only">
            Tìm snippet theo tiêu đề
          </label>
          <input
            id="snippet-search"
            type="text"
            className="w-full border-0 border-b bg-transparent py-2.5 pl-0 pr-9 text-[15px] text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-b focus:border-[var(--accent)]"
            style={{ borderBottom: "1px solid var(--line)" }}
            placeholder="Tìm theo tiêu đề..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <AiOutlineSearch
            className="pointer-events-none absolute right-1 top-3 text-xl text-[var(--muted)]"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="grid gap-5 pt-2">
        {filteredPosts.map((post) => (
          <PostPreview key={post.slug} snippet={post} />
        ))}
      </div>
    </>
  );
};

export default SnippetList;
