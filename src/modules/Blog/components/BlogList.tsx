import { Post } from ".contentlayer/generated";
import { AiOutlineSearch } from "react-icons/ai";
import PostPreview from "./PostPreview";
import { useState, useMemo } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { AnimatePresence } from "framer-motion";

const BlogList = ({ posts }: { posts: Post[] }) => {
  const [search, setSearch] = useState("");
  const [debouncedValue] = useDebouncedValue(search, 200);

  const filteredPosts = useMemo(() => {
    if (debouncedValue === "") {
      return posts;
    }
    return posts.filter((post) =>
      post.title.toLowerCase().includes(debouncedValue.toLowerCase())
    );
  }, [posts, debouncedValue]);

  return (
    <>
      <div className="flex w-full flex-col items-start space-y-4 pb-8">
        <p className="secnum !mb-0">Tổng cộng {posts.length} bài viết</p>
        <div className="relative w-full max-w-md">
          <label htmlFor="blog-search" className="sr-only">
            Tìm bài viết theo tiêu đề
          </label>
          <input
            id="blog-search"
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
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, idx) => (
            <PostPreview key={post.slug} post={post} idx={idx} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BlogList;
