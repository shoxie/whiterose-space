import { allPosts, Post } from ".contentlayer/generated";
import siteMetadata from "data/siteMeta";
import { useMDXComponent } from "next-contentlayer/hooks";
import moment from "moment";
import { NewsArticleJsonLd, NextSeo } from "next-seo";
import { useTheme } from "next-themes";
// import PostLayout from "src/layouts/PostLayout";
import components from "src/common/MDXComponents";
import PagesLayout from "@/layouts/Pages";
import Tags from "@/common/Tags";
import Giscus from "@giscus/react";

export default function BlogDetailPage({ post }: { post: Post }) {
  const Component = useMDXComponent(post.body.code);
  const { resolvedTheme } = useTheme();
  return (
    <PagesLayout>
      <SEO post={post} />
      <article>
        <header className="mb-8 border-b border-highlightHigh pb-6">
          <h1 className="font-display text-4xl font-black leading-tight text-text md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
            <time dateTime={post.date} title={moment(post.date).format("LL")}>
              {moment(post.date).format("LL")}
            </time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime.text}</span>
          </div>
          <p className="mt-4 text-lg text-subtle">{post.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Tags key={tag} content={tag} />
            ))}
          </div>
        </header>
        <div className="mt-5 prose prose-xl">
          <Component
            components={{
              ...components,
            }}
          />
        </div>
      </article>
      <div className="mt-12">
        <Giscus
          repo="shoxie/whiterose-space"
          repoId="R_kgDOHr5Weg"
          category="Show and tell"
          categoryId="DIC_kwDOHr5Wes4CSx6d"
          mapping="pathname"
          strict="0"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="bottom"
          theme={resolvedTheme === "dawn" ? "light" : "dark"}
          lang="en"
        />
      </div>
    </PagesLayout>
  );
}

function SEO({ post }: { post: Post }) {
  const image_url = `${siteMetadata.siteUrl}/${post.image}`;
  return (
    <>
      <NextSeo
        title={post.title}
        description={post.summary}
        openGraph={{
          type: "article",
          images: post.image
            ? [
                {
                  url: image_url,
                },
              ]
            : [],
          article: {
            publishedTime: post.date,
            tags: post.tags,
            section: post.tags[0],
          },
        }}
      />
      <NewsArticleJsonLd
        url={`${siteMetadata.siteUrl}/blog/${post.slug}`}
        title={post.title}
        images={post.image ? [image_url] : []}
        section={post.tags[0]}
        keywords={post.tags.join(",")}
        authorName={siteMetadata.author}
        description={post.summary}
        body={post.body.raw.slice(0, 200)}
        datePublished={post.date}
        dateCreated={post.date}
        publisherName={siteMetadata.author}
        publisherLogo={siteMetadata.siteUrl + siteMetadata.siteLogo}
      />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: allPosts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post.slug === params.slug);
  return { props: { post } };
}
