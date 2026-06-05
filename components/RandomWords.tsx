import { words, hardWords } from "./words";

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates a randomized list of words.
 * - Converts words to lowercase for uniform appearance (or capitalizes if in hard mode).
 * - Employs a Fisher-Yates shuffle to ensure variety.
 * - Prevents consecutive duplicates.
 * - Injects numbers if hasNumbers is true.
 * - Appends punctuation marks and enforces sentence capitalization if hasPunctuation is true.
 */
export function generateWords(
  count: number,
  hasPunctuation = false,
  hasNumbers = false,
  difficulty = "easy"
): string {
  if (count <= 0) return "";

  // Choose word list based on difficulty setting
  const basePool = difficulty === "hard" ? hardWords : words;
  if (basePool.length === 0) return "";

  const normalizedWords = basePool.map((w) => w.toLowerCase());
  
  const generated: string[] = [];
  let currentPool: string[] = [];
  let capitalizeNext = false;

  while (generated.length < count) {
    // 1. Inject random numbers if enabled (approx. 12% chance, avoiding the first word)
    if (hasNumbers && Math.random() < 0.12 && generated.length > 0) {
      const randomNum = Math.floor(Math.random() * 100); // Generate a number from 0 to 99
      generated.push(randomNum.toString());
      continue;
    }

    // 2. Reshuffle pool if empty
    if (currentPool.length === 0) {
      currentPool = shuffleArray(normalizedWords);
    }

    let nextWord = currentPool.pop();
    if (!nextWord) continue;

    // Prevent consecutive duplicate words
    const lastWord = generated[generated.length - 1];
    if (lastWord === nextWord) {
      if (currentPool.length > 0) {
        const swapIndex = Math.floor(Math.random() * currentPool.length);
        const temp = currentPool[swapIndex];
        currentPool[swapIndex] = nextWord;
        nextWord = temp;
      } else {
        const newPool = shuffleArray(normalizedWords);
        let pickIndex = newPool.findIndex((w) => w !== lastWord);
        if (pickIndex === -1) pickIndex = 0;
        nextWord = newPool.splice(pickIndex, 1)[0];
        currentPool = newPool;
      }
    }

    // 3. Hard Mode capitalization (approx 25% chance of capitalizing a word)
    if (difficulty === "hard" && Math.random() < 0.25) {
      nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
    }

    // 4. Apply sentence capitalization from previous period/question/exclamation marks
    if (capitalizeNext) {
      nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      capitalizeNext = false;
    }

    // 5. Append punctuation if enabled (approx. 18% chance, avoiding the first word)
    if (hasPunctuation && Math.random() < 0.18 && generated.length > 0) {
      const punctuations = [".", ",", "?", "!", ";", "-"];
      const punc = punctuations[Math.floor(Math.random() * punctuations.length)];
      nextWord = nextWord + punc;

      // Set capitalization trigger for the next word if this punctuation ends a sentence
      if (punc === "." || punc === "?" || punc === "!") {
        capitalizeNext = true;
      }
    }

    generated.push(nextWord);
  }

  // Capitalize the very first word if punctuation mode is enabled to start a mock sentence
  if (hasPunctuation && generated.length > 0) {
    generated[0] = generated[0].charAt(0).toUpperCase() + generated[0].slice(1);
  }

  return generated.join(" ");
}
