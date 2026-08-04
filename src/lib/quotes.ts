import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

export const TAG_DETAILS = {
  funny: "Humorous, witty, comedic",
  crude: "Vulgar, profane, raunchy",
  dark: "Grim, bleak, sinister",
  angry: "Wrathful, aggressive, outraged",
  profound: "Deep truth, philosophical weight",
  clever: "Sharp wordplay, elegant logic",
  insightful: "Keen observation, wisdom",
  inspiring: "Motivating, uplifting",
  romantic: "Love, passion, devotion",
  sad: "Grief, loss, melancholy",
  comforting: "Reassuring, warm, gentle",
  insult: "Directed putdown or burn",
  faith: "Religion, spirituality, belief",
  family: "Parents, children, home",
  death: "Mortality, dying, the end",
  craft: "Storytelling, art, creative process",
  favorite: "Personal standout",
  personal: "From family or friends",
} as const;

export type TagName = keyof typeof TAG_DETAILS;

export interface Reference {
  id: string;
  label: string;
  slug: string;
  url?: string;
}

export interface WorkReference extends Reference {
  type: string;
}

export interface Quote {
  author: Reference;
  date?: string;
  href: string;
  searchText: string;
  slug: string;
  tags: TagName[];
  text: string;
  title: string;
  work?: WorkReference;
}

export interface CountedTag {
  count: number;
  description: string;
  name: TagName;
}

export interface AuthorSummary extends Reference {
  quotes: Quote[];
  tags: CountedTag[];
  works: WorkReference[];
}

export interface WorkSummary extends WorkReference {
  authors: Reference[];
  quotes: Quote[];
  tags: CountedTag[];
}

export interface TagSummary extends CountedTag {
  quotes: Quote[];
}

const QUOTES_DIRECTORY = resolve(process.cwd(), "vault/quotes");
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const METADATA_FIELDS = new Set([
  "Artist",
  "Audiobook",
  "Author",
  "Book",
  "Books",
  "Comic",
  "Company",
  "Date",
  "Developer",
  "Game",
  "Movie",
  "Poem",
  "Poet",
  "Site",
  "Song",
  "Source",
]);
const CREATOR_FIELDS = ["Author", "Poet", "Artist", "Developer", "Company", "Source", "Movie"];
const WORK_FIELDS = ["Book", "Books", "Game", "Comic", "Movie", "Song", "Poem", "Audiobook", "Site"];
const WORK_TYPE_LABELS: Record<string, string> = {
  Audiobook: "Audiobook",
  Book: "Book",
  Books: "Book",
  Comic: "Comic",
  Game: "Game",
  Movie: "Movie",
  Poem: "Poem",
  Site: "Site",
  Song: "Song",
};

let quoteCache: Quote[] | undefined;

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug || "untitled";
}

function parseTags(frontmatter: string, path: string): TagName[] {
  const tagLine = frontmatter.match(/^tags:\s*\[([^\]]*)\]\s*$/m);
  if (!tagLine) {
    throw new Error(`${path}: expected bracketed tags in YAML frontmatter`);
  }

  const tags = tagLine[1]
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length < 1 || tags.length > 4) {
    throw new Error(`${path}: expected between one and four tags`);
  }

  for (const tag of tags) {
    if (!(tag in TAG_DETAILS)) {
      throw new Error(`${path}: unknown tag ${tag}`);
    }
  }

  return tags as TagName[];
}

function parseReference(rawValue: string): Reference | undefined {
  const value = rawValue.trim();
  if (!value || value.toLowerCase() === "none") {
    return undefined;
  }

  const wikilink = value.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\](.*)$/);
  if (wikilink) {
    const id = wikilink[1].trim();
    const suffix = wikilink[3].trim();
    const label = `${(wikilink[2] ?? id).trim()}${suffix ? ` ${suffix}` : ""}`;
    return { id, label, slug: slugify(id === "Unknown_Author" ? "Unknown" : id) };
  }

  const markdownLink = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*)$/);
  if (markdownLink) {
    const suffix = markdownLink[3].trim();
    const label = `${markdownLink[1].trim()}${suffix ? ` ${suffix}` : ""}`;
    return { id: markdownLink[1].trim(), label, slug: slugify(markdownLink[1]), url: markdownLink[2] };
  }

  return { id: value, label: value, slug: slugify(value) };
}

function collectMetadata(body: string): { content: string; metadata: Map<string, string> } {
  const metadata = new Map<string, string>();
  const contentLines: string[] = [];

  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Za-z]+):\s*(.+)$/);
    if (match && METADATA_FIELDS.has(match[1])) {
      metadata.set(match[1], match[2].trim());
    } else {
      contentLines.push(line);
    }
  }

  return { content: contentLines.join("\n").trim(), metadata };
}

function stripOuterQuotationMarks(content: string): string {
  const hasStraightQuotes = content.startsWith('"') && content.endsWith('"');
  const hasCurlyQuotes = content.startsWith("“") && content.endsWith("”");
  if (hasStraightQuotes || hasCurlyQuotes) {
    return content.slice(1, -1).trim();
  }
  return content;
}

function findCreator(metadata: Map<string, string>): Reference {
  for (const field of CREATOR_FIELDS) {
    const rawValue = metadata.get(field);
    if (!rawValue) {
      continue;
    }

    const creator = parseReference(rawValue);
    if (creator) {
      return creator.id === "Unknown_Author" ? { id: "Unknown", label: "Unknown", slug: "unknown" } : creator;
    }
  }

  return { id: "Unknown", label: "Unknown", slug: "unknown" };
}

function findWork(metadata: Map<string, string>, creator: Reference): WorkReference | undefined {
  for (const field of WORK_FIELDS) {
    const rawValue = metadata.get(field);
    if (!rawValue) {
      continue;
    }

    const reference = parseReference(rawValue);
    if (!reference) {
      continue;
    }

    if ((field === "Movie" || field === "Site") && reference.slug === creator.slug) {
      continue;
    }

    return { ...reference, type: WORK_TYPE_LABELS[field] ?? field };
  }

  return undefined;
}

function parseQuote(path: string): Quote {
  const raw = readFileSync(path, "utf8");
  const frontmatter = raw.match(FRONTMATTER_PATTERN);
  if (!frontmatter) {
    throw new Error(`${path}: missing YAML frontmatter`);
  }

  const title = basename(path, ".md");
  const slug = slugify(title);
  const tags = parseTags(frontmatter[1], path);
  const parsedBody = collectMetadata(raw.replace(FRONTMATTER_PATTERN, ""));
  const content = stripOuterQuotationMarks(parsedBody.content);
  const { metadata } = parsedBody;
  const author = findCreator(metadata);
  const work = findWork(metadata, author);
  const date = metadata.get("Date");

  if (!content) {
    throw new Error(`${path}: quote text is empty`);
  }

  const searchText = [title, content, author.label, work?.label ?? "", tags.join(" ")].join(" ").toLowerCase();

  return {
    author,
    date,
    href: `/quotes/${slug}/`,
    searchText,
    slug,
    tags,
    text: content,
    title,
    work,
  };
}

export function getQuotes(): Quote[] {
  if (quoteCache) {
    return quoteCache;
  }

  const seenSlugs = new Map<string, string>();
  const quotes: Quote[] = readdirSync(QUOTES_DIRECTORY)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => resolve(QUOTES_DIRECTORY, filename))
    .map(parseQuote)
    .sort((left, right) => left.title.localeCompare(right.title));

  for (const quote of quotes) {
    const existingTitle = seenSlugs.get(quote.slug);
    if (existingTitle) {
      throw new Error(`Duplicate quote slug ${quote.slug}: ${existingTitle} and ${quote.title}`);
    }
    seenSlugs.set(quote.slug, quote.title);
  }

  quoteCache = quotes;
  return quotes;
}

function countTags(quotes: Quote[]): CountedTag[] {
  const counts = new Map<TagName, number>();
  for (const quote of quotes) {
    for (const tag of quote.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ count, description: TAG_DETAILS[name], name }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function getAuthors(quotes = getQuotes()): AuthorSummary[] {
  const grouped = new Map<string, { reference: Reference; quotes: Quote[] }>();
  for (const quote of quotes) {
    const current = grouped.get(quote.author.slug) ?? { reference: quote.author, quotes: [] };
    current.quotes.push(quote);
    grouped.set(quote.author.slug, current);
  }

  return [...grouped.values()]
    .map(({ reference, quotes: authorQuotes }) => {
      const workMap = new Map<string, WorkReference>();
      for (const quote of authorQuotes) {
        if (quote.work) {
          workMap.set(quote.work.slug, quote.work);
        }
      }

      return {
        ...reference,
        quotes: authorQuotes,
        tags: countTags(authorQuotes),
        works: [...workMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getWorks(quotes = getQuotes()): WorkSummary[] {
  const grouped = new Map<string, { reference: WorkReference; quotes: Quote[] }>();
  for (const quote of quotes) {
    if (!quote.work) {
      continue;
    }
    const current = grouped.get(quote.work.slug) ?? { reference: quote.work, quotes: [] };
    current.quotes.push(quote);
    grouped.set(quote.work.slug, current);
  }

  return [...grouped.values()]
    .map(({ reference, quotes: workQuotes }) => {
      const authorMap = new Map<string, Reference>();
      for (const quote of workQuotes) {
        authorMap.set(quote.author.slug, quote.author);
      }
      return {
        ...reference,
        authors: [...authorMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
        quotes: workQuotes,
        tags: countTags(workQuotes),
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getTags(quotes = getQuotes()): TagSummary[] {
  return (Object.keys(TAG_DETAILS) as TagName[])
    .map((name) => {
      const tagQuotes = quotes.filter((quote) => quote.tags.includes(name));
      return {
        count: tagQuotes.length,
        description: TAG_DETAILS[name],
        name,
        quotes: tagQuotes,
      };
    })
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}
