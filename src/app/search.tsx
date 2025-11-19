import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { theme } from '../theme/colors';
import { searchCorpus, CorpusSearchResponse, BookContentSearchResult } from '../lib/search';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CorpusSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'texts' | 'authors' | 'genres'>('all');

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchCorpus(trimmed, 'en');
      setResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentResult = (item: BookContentSearchResult, index: number) => {
    const snippet = item.node.highlights?.[0] || item.node.text;
    const bookTitle = item.book.primaryName;
    const authorName = item.book.author?.primaryName;

    return (
      <View key={`${item.book.id}-${index}`} style={styles.resultCard}>
        <Text style={styles.resultSnippet} numberOfLines={4}>
          {snippet}
        </Text>
        <View style={styles.resultMetaRow}>
          <Text style={styles.resultBook}>{bookTitle}</Text>
          {authorName ? <Text style={styles.resultAuthor}>{authorName}</Text> : null}
        </View>
      </View>
    );
  };

  const hasAnyResults =
    !!results &&
    (results.content.total > 0 ||
      results.books.found > 0 ||
      results.authors.found > 0 ||
      results.genres.found > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a text"
          placeholderTextColor={theme.secondary}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Pressable
          style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!query.trim() || isLoading}
        >
          <Text style={styles.searchButtonLabel}>Search</Text>
        </Pressable>
      </View>

      {/* Tabs: All / Texts / Authors / Genres */}
      <View style={styles.tabBar}>
        {([
          { key: 'all', label: 'All' },
          { key: 'texts', label: 'Texts' },
          { key: 'authors', label: 'Authors' },
          { key: 'genres', label: 'Genres' },
        ] as const).map(tab => (
          <Pressable
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.accent} />
          <Text style={styles.loadingText}>Searching Usul…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
        {results && (
          <>
            {(activeTab === 'all' || activeTab === 'texts') &&
              results.content.total > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Content</Text>
                {results.content.results.map(renderContentResult)}
              </View>
            )}

            {(activeTab === 'all' || activeTab === 'texts') &&
              results.books.found > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Texts</Text>
                {results.books.hits.map((book: any) => (
                  <View key={book.id} style={styles.resultCard}>
                    <Text style={styles.resultBook}>{book.primaryName}</Text>
                    {book.author?.primaryName ? (
                      <Text style={styles.resultAuthor}>{book.author.primaryName}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {(activeTab === 'all' || activeTab === 'authors') &&
              results.authors.found > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Authors</Text>
                {results.authors.hits.map((author: any) => (
                  <View key={author.id} style={styles.resultCard}>
                    <Text style={styles.resultBook}>{author.primaryName}</Text>
                    {author.secondaryName ? (
                      <Text style={styles.resultAuthor}>{author.secondaryName}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {(activeTab === 'all' || activeTab === 'genres') &&
              results.genres.found > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genres</Text>
                {results.genres.hits.map((genre: any) => (
                  <View key={genre.id} style={styles.resultCard}>
                    <Text style={styles.resultBook}>{genre.primaryName}</Text>
                    {typeof genre.booksCount === 'number' && (
                      <Text style={styles.resultAuthor}>{genre.booksCount} texts</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {results && !hasAnyResults && !isLoading && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  tabButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: theme.surface,
    borderColor: theme.accent,
  },
  tabLabel: {
    fontSize: 13,
    color: theme.secondary,
  },
  tabLabelActive: {
    color: theme.accent,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: theme.primary,
    fontSize: 15,
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.accent,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    color: theme.secondary,
    fontSize: 13,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#C53030',
    fontSize: 13,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    marginBottom: 10,
  },
  resultSnippet: {
    color: theme.primary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  resultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  resultBook: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  resultAuthor: {
    color: theme.secondary,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: theme.secondary,
    fontSize: 14,
  },
});


