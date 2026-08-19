import { Post } from ".contentlayer/generated";
import Tags from "@/common/Tags";
import moment from "moment";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const PostPreview = ({ post, idx }: { post: Post; idx: number }) => {
  const reduced = useReducedMotion();
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.08 }}
      className="group relative flex flex-col space-y-3 rounded-xl border border-highlightHigh bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-love/60 hover:shadow-[0_8px_30px_rgba(225,29,46,0.12)]"
    >
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link
          href={`/blog/${post.slug}`}
          className="font-display text-2xl font-bold text-text transition-colors duration-200 group-hover:text-love"
        >
          {post.title}
        </Link>
        <time
          dateTime={post.date}
          className="text-sm text-subtle"
        >
          {moment(post.date).format("LL")}
        </time>
      </div>
      <p className="text-subtle">{post.summary}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {post.tags?.map((tag) => (
          <Tags key={tag} content={tag} />
        ))}
      </div>
    </motion.article>
  );
};

export default PostPreview;
