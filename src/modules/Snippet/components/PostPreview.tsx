import { Snippet } from ".contentlayer/generated";
import Tags from "@/common/Tags";
import moment from "moment";
import Link from "next/link";

const PostPreview = ({ snippet }: { snippet: Snippet }) => {
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex flex-row items-center justify-between">
        <Link href={`/snippet/${snippet.slug}`} className="text-2xl font-bold hover:underline">
          {snippet.title}
        </Link>
        <time dateTime={snippet.date}>{moment(snippet.date).format("LL")}</time>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
            {snippet.tags?.map((tag) => (
              <Tags key={tag} content={tag} />
            ))}
          </div>
      <p>{snippet.description}</p>
    </div>
  );
};

export default PostPreview;
