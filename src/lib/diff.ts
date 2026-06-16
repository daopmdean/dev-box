export interface DiffChange {
  type: "added" | "removed" | "common";
  value: string;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  caseInsensitive?: boolean;
}

function normalize(str: string, options?: DiffOptions): string {
  let val = str;
  if (options?.ignoreWhitespace) {
    // Remove all whitespace to check structural similarity
    val = val.replace(/\s+/g, "");
  }
  if (options?.caseInsensitive) {
    val = val.toLowerCase();
  }
  return val;
}

export function diffArrays(
  one: string[],
  two: string[],
  options?: DiffOptions
): DiffChange[] {
  const n = one.length;
  const m = two.length;

  // dp[i][j] stores the length of LCS of one[0..i-1] and two[0..j-1]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const val1 = normalize(one[i - 1], options);
    for (let j = 1; j <= m; j++) {
      const val2 = normalize(two[j - 1], options);
      if (val1 === val2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffChange[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalize(one[i - 1], options) === normalize(two[j - 1], options)) {
      result.push({ type: "common", value: two[j - 1] }); // Prefer the new text's layout/version
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", value: two[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      result.push({ type: "removed", value: one[i - 1] });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Compare two texts line-by-line.
 */
export function diffLines(oldText: string, newText: string, options?: DiffOptions): DiffChange[] {
  if (oldText === "" && newText === "") return [];
  
  const oldLines = oldText ? oldText.split(/\r?\n/) : [];
  const newLines = newText ? newText.split(/\r?\n/) : [];

  if (oldText === "") return newLines.map(line => ({ type: "added", value: line }));
  if (newText === "") return oldLines.map(line => ({ type: "removed", value: line }));

  return diffArrays(oldLines, newLines, options);
}

/**
 * Compare two texts word-by-word.
 * Splits on whitespace, punctuation and word boundaries.
 */
export function diffWords(oldText: string, newText: string, options?: DiffOptions): DiffChange[] {
  if (oldText === "" && newText === "") return [];

  const wordRegex = /(\s+|[^\w\s]|_)/;
  const oldWords = oldText ? oldText.split(wordRegex).filter(Boolean) : [];
  const newWords = newText ? newText.split(wordRegex).filter(Boolean) : [];

  if (oldText === "") return newWords.map(word => ({ type: "added", value: word }));
  if (newText === "") return oldWords.map(word => ({ type: "removed", value: word }));

  return diffArrays(oldWords, newWords, options);
}

/**
 * Compare two texts character-by-character.
 */
export function diffChars(oldText: string, newText: string, options?: DiffOptions): DiffChange[] {
  if (oldText === "" && newText === "") return [];

  const oldChars = oldText ? oldText.split("") : [];
  const newChars = newText ? newText.split("") : [];

  if (oldText === "") return newChars.map(char => ({ type: "added", value: char }));
  if (newText === "") return oldChars.map(char => ({ type: "removed", value: char }));

  return diffArrays(oldChars, newChars, options);
}
