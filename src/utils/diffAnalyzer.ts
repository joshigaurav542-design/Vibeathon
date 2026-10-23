import { DiffToken } from '../types';

/**
 * Word-level Longest Common Subsequence (LCS) diff algorithm.
 * Compares the original draft against each persona rewrite.
 */
export function computeWordDiff(originalText: string, rewrittenText: string): DiffToken[] {
  const cleanOrig = originalText.trim();
  const cleanRewr = rewrittenText.trim();

  if (!cleanOrig && !cleanRewr) return [];
  if (!cleanOrig) {
    return cleanRewr.split(/\s+/).map((text) => ({ type: 'added', text }));
  }
  if (!cleanRewr) {
    return cleanOrig.split(/\s+/).map((text) => ({ type: 'removed', text }));
  }

  const words1 = cleanOrig.split(/\s+/);
  const words2 = cleanRewr.split(/\s+/);
  const m = words1.length;
  const n = words2.length;

  // Optimize table allocation for typical message lengths (up to 500 words)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    const w1 = normalizeWord(words1[i - 1]);
    for (let j = 1; j <= n; j++) {
      const w2 = normalizeWord(words2[j - 1]);
      if (w1 === w2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build the diff
  let i = m;
  let j = n;
  const tokens: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizeWord(words1[i - 1]) === normalizeWord(words2[j - 1])) {
      tokens.push({ type: 'unchanged', text: words2[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.push({ type: 'added', text: words2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.push({ type: 'removed', text: words1[i - 1] });
      i--;
    }
  }

  return tokens.reverse();
}

/**
 * Normalizes punctuation and casing for intelligent diff alignment
 */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates live rewrite delta metrics between original and rewritten text
 */
export function calculateDeltaStats(originalText: string, rewrittenText: string) {
  const origWords = originalText.trim() ? originalText.trim().split(/\s+/) : [];
  const rewrWords = rewrittenText.trim() ? rewrittenText.trim().split(/\s+/) : [];

  const origWordCount = origWords.length;
  const rewrWordCount = rewrWords.length;

  const wordDelta = rewrWordCount - origWordCount;
  const wordCountDeltaPercent = origWordCount > 0 
    ? Math.round((wordDelta / origWordCount) * 100) 
    : 0;

  const origChars = originalText.length;
  const rewrChars = rewrittenText.length;
  const charDelta = rewrChars - origChars;
  const charDeltaPercent = origChars > 0 ? Math.round((charDelta / origChars) * 100) : 0;

  // Vocabulary Shift calculation using Unique Word Sets
  const origVocab = new Set(origWords.map(normalizeWord).filter(Boolean));
  const rewrVocab = new Set(rewrWords.map(normalizeWord).filter(Boolean));

  let newWordsCount = 0;
  rewrVocab.forEach((word) => {
    if (!origVocab.has(word)) {
      newWordsCount++;
    }
  });

  const vocabularyShiftPercent = rewrVocab.size > 0 
    ? Math.round((newWordsCount / rewrVocab.size) * 100) 
    : 0;

  // Average reading speed = 200 words per minute
  const readingTimeSeconds = Math.max(1, Math.round((rewrWordCount / 200) * 60));

  return {
    origWordCount,
    rewrWordCount,
    wordDelta,
    wordCountDeltaPercent,
    origChars,
    rewrChars,
    charDelta,
    charDeltaPercent,
    vocabularyShiftPercent,
    readingTimeSeconds,
  };
}
