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
      <div className="flex w-full flex-col items-start space-y-4 pb-6">
        <span className="text-subtle">Tổng cộng {snippets.length} snippets.</span>
        <div className="relative w-full max-w-md">
          <label htmlFor="snippet-search" className="sr-only">
            Tìm snippet theo tiêu đề
          </label>
          <input
            id="snippet-search"
            type="text"
            className="w-full rounded-lg border border-highlightHigh bg-surface py-2.5 pl-4 pr-11 text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-love/60"
            placeholder="Tìm theo tiêu đề..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <AiOutlineSearch
            className="pointer-events-none absolute right-3.5 top-3 text-xl text-subtle"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="flex flex-col space-y-5 pt-2">
        {filteredPosts.map((post) => (
          <PostPreview key={post.slug} snippet={post} />
        ))}
      </div>
    </>
  );
};

export default SnippetList;
