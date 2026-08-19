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
      <div className="flex w-full flex-col items-start space-y-4 pb-6">
        <span className="text-subtle">
          Tổng cộng {posts.length} bài viết.
        </span>
        <div className="relative w-full max-w-md">
          <label htmlFor="blog-search" className="sr-only">
            Tìm bài viết theo tiêu đề
          </label>
          <input
            id="blog-search"
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
