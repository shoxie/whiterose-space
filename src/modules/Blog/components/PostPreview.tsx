import { Post } from ".contentlayer/generated";
import Tags from "@/common/Tags";
import moment from "moment";
import Link from "next/link";
import { motion } from "framer-motion";

const PostPreview = ({ post, idx }: { post: Post, idx: number }) => {
  return (
    <motion.div initial={{
      opacity: 0,
      y: 20,
    }}
    animate={{
      opacity: 1,
      y: 0,
      transition: {
        duration: (idx + 1) * 0.3,
        delay: (idx + 1) * 0.3,
      },
    }}
    className="flex flex-col space-y-5">
      <div className="flex flex-row items-center justify-between">
        <Link href={`/blog/${post.slug}`} className="text-2xl font-bold hover:underline">
          {post.title}
        </Link>
        <time dateTime={post.date}>{moment(post.date).format("LL")}</time>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
            {post.tags?.map((tag) => (
              <Tags key={tag} content={tag} />
            ))}
          </div>
      <p>{post.summary}</p>
    </motion.div>
  );
};

export default PostPreview;
