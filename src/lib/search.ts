import { Platform } from 'react-native';

const DEFAULT_API_BASE =
  (process as any).env?.EXPO_PUBLIC_USUL_API ||
  'https://usul-api-fqhbhse7dvbydgg8.eastus-01.azurewebsites.net';

export interface SemanticSearchBookNode {
  id?: string;
  text: string;
  metadata: {
    chapters: number[];
    pages: {
      index: number;
      volume: string;
      page: number;
    }[];
  };
  highlights?: string[];
  score?: number;
}

export interface BookContentSearchResult {
  node: SemanticSearchBookNode;
  versionId: string;
  book: {
    id: string;
    slug: string;
    primaryName: string;
    secondaryName?: string;
    transliteration?: string;
    author: {
      id: string;
      slug: string;
      primaryName: string;
      secondaryName?: string;
      transliteration?: string;
      year?: number;
    };
  };
}

export interface CorpusSearchResponse {
  content: {
    total: number;
    results: BookContentSearchResult[];
  };
  books: {
    found: number;
    hits: any[];
  };
  authors: {
    found: number;
    hits: any[];
  };
  genres: {
    found: number;
    hits: any[];
  };
}

const buildUrl = (path: string, params: Record<string, string | number | undefined>) => {
  const base = DEFAULT_API_BASE.replace(/\/+$/, '');
  const url = new URL(path, base);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export async function searchCorpus(
  query: string,
  locale: 'en' | 'ar' = 'en',
): Promise<CorpusSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      content: { total: 0, results: [] },
      books: { found: 0, hits: [] },
      authors: { found: 0, hits: [] },
      genres: { found: 0, hits: [] },
    };
  }

  const url = buildUrl('/search', { q: trimmed, locale });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Search request failed (${response.status})${text ? `: ${text}` : ''}`,
    );
  }

  return (await response.json()) as CorpusSearchResponse;
}


