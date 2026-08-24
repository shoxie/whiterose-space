import { Post } from ".contentlayer/generated";
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
      className="card"
    >
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <time className="card__tag !mb-0" dateTime={post.date}>
          {moment(post.date).format("LL")}
        </time>
      </div>
      <h3 className="mt-3">
        <Link
          href={`/blog/${post.slug}`}
          className="transition-colors duration-300 hover:text-[var(--accent)]"
        >
          {post.title}
        </Link>
      </h3>
      <p className="text-[14px] leading-[1.7] text-[var(--muted)]">
        {post.summary}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {post.tags?.map((tag) => (
          <Link key={tag} href={`/tag/${tag}`} className="chip !py-1.5">
            {tag}
            <i>→</i>
          </Link>
        ))}
      </div>
    </motion.article>
  );
};

export default PostPreview;
