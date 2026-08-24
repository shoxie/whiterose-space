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
        <header className="mb-10">
          <p className="secnum">TRANG — {page.slug.toUpperCase()}</p>
          <h1 className="h2">{page.title}</h1>
          <p className="max-w-[62ch] text-[15px] leading-[1.75] text-[var(--muted)]">
            {page.description}
          </p>
        </header>
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
