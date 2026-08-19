import { useMDXComponent } from "next-contentlayer/hooks";
import { allPages, Page } from ".contentlayer/generated";
import components from "src/common/MDXComponents";
import { NextSeo } from "next-seo";
import PagesLayout from "@/layouts/Pages";

export default function Pages({ page }: { page: Page }) {
  const Component = useMDXComponent(page.body.code);

  return (
    <PagesLayout>
      <article>
        <NextSeo title={page.title} description={page.description} />
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-subtle">
          門 / {page.title}
        </p>
        <h1 className="font-display text-4xl font-black tracking-tight text-text md:text-6xl">
          {page.title}
        </h1>
        <p className="mt-3 mb-8 text-subtle">{page.description}</p>
        <div className="w-full prose dark:prose-dark">
          <Component components={components} />
        </div>
      </article>
    </PagesLayout>
  );
}

export async function getStaticPaths() {
  return {
    paths: allPages.map((page) => ({
      params: { slug: page.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const page = allPages.find((page) => page.slug === params.slug);
  return { props: { page } };
}
