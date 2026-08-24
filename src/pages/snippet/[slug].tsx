import { allSnippets, Snippet } from ".contentlayer/generated";
import siteMetadata from "data/siteMeta";
import { useMDXComponent } from "next-contentlayer/hooks";
import moment from "moment";
import { ArticleJsonLd, NextSeo } from "next-seo";
import Link from "next/link";
import components from "@/common/MDXComponents";
import PagesLayout from "@/layouts/Pages";

export default function BlogDetailPage({ snippet }: { snippet: Snippet }) {
  const Component = useMDXComponent(snippet.body.code);
  return (
    <>
      <NextSeo
        title={snippet.title}
        description={snippet.description}
        openGraph={{
          type: "article",
          title: snippet.title,
          description: snippet.description,
        }}
      />
      <PagesLayout>
        <article>
          <header className="mb-10 border-b border-[var(--line)] pb-8">
            <p className="secnum !mb-4">
              <time dateTime={snippet.date}>
                {moment(snippet.date).format("LL")}
              </time>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {snippet.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={snippet.logo}
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 rounded-full object-contain"
                />
              )}
              <h1 className="h2 !mb-0">{snippet.title}</h1>
            </div>
            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.75] text-[var(--muted)]">
              {snippet.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {snippet.tags?.map((tag) => (
                <Link key={tag} href={`/tag/${tag}`} className="chip">
                  {tag}
                </Link>
              ))}
            </div>
          </header>
          <div className="prose prose-xl">
            <Component
              components={{
                ...components,
              }}
            />
          </div>
        </article>
      </PagesLayout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: allSnippets.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const snippet = allSnippets.find((snippet) => snippet.slug === params.slug);
  return { props: { snippet } };
}
