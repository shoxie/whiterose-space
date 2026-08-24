import { allPosts, allSnippets } from ".contentlayer/generated";

export type Tag = {
  name: string;
  count: number;
};

/**
 * Tags are site-wide: they aggregate blog posts AND snippets so that every
 * tag rendered by any page has a matching /tag/[slug] route.
 */
export function allTags() {
  const docs = [...allPosts, ...allSnippets];
  const tags: Tag[] = [];
  for (const doc of docs) {
    if ((doc as { draft?: boolean }).draft == true) continue;
    for (const tag of doc.tags) {
      const existingTag = tags.find((t) => t.name === tag);
      if (existingTag) {
        existingTag.count++;
      } else {
        tags.push({ name: tag, count: 1 });
      }
    }
  }
  return tags;
}
