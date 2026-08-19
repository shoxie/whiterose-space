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
      <div className="flex flex-col items-start w-full pb-5 space-y-4">
        <span>
          Total of {posts.length} post(s) written. Use search bar below to
          search for title.
        </span>
        <div className="relative w-3/4">
          <input
            type="text"
            className="w-full pl-4 border border-highlightHigh rounded-md bg-base focus:outline-none py-1.5"
            placeholder="Search by title"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 top-2">
            <AiOutlineSearch className="text-xl" />
          </div>
        </div>
      </div>
      <div className="flex flex-col pt-5 space-y-5">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, idx) => (
            <PostPreview key={idx} post={post} idx={idx} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BlogList;
