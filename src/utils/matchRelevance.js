// Decide whether a scored opportunity is close enough to suggest to a user.
// A suggestion needs enough matching skills AND a job title related to the
// user's target role.

export const MINIMUM_MATCH_PERCENTAGE = 40;

// Words that describe level or job family but not the field of work.
const GENERIC_TITLE_WORDS = new Set([
  "a", "an", "and", "of", "the", "in", "for", "to",
  "junior", "senior", "lead", "principal", "head", "chief", "mid",
  "entry", "level", "graduate", "intern", "internship", "trainee",
  "assistant", "associate",
  "analyst", "engineer", "engineering", "developer", "development",
  "specialist", "manager", "management", "officer", "coordinator",
  "consultant", "supervisor", "executive", "administrator", "designer",
  "technician", "scientist", "strategist",
  "digital", "technology", "tech", "professional",
]);

// Treat common spellings of the same field as one word.
const PHRASES = [
  [/\bfront[\s-]*end\b/g, "frontend"],
  [/\bback[\s-]*end\b/g, "backend"],
  [/\bfull[\s-]*stack\b/g, "fullstack"],
  [/\bcyber[\s-]*security\b/g, "cybersecurity"],
  [/\bdev[\s-]*ops\b/g, "devops"],
  [/\bml\b/g, "machine learning"],
  [/\bartificial intelligence\b/g, "ai"],
];

const titleWords = (title) => {
  if (typeof title !== "string") return [];

  const text = PHRASES.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    title.toLowerCase()
  );

  return text.split(/[^a-z0-9+#]+/).filter(Boolean);
};

export const isRelatedTitle = (targetJobTitle, opportunityTitle) => {
  const targetWords = titleWords(targetJobTitle);
  const jobWords = new Set(titleWords(opportunityTitle));

  if (targetWords.length === 0 || jobWords.size === 0) return false;

  const fieldWords = targetWords.filter(
    (word) => !GENERIC_TITLE_WORDS.has(word)
  );

  // A target made only of general words must appear in full.
  if (fieldWords.length === 0) {
    return targetWords.every((word) => jobWords.has(word));
  }

  return fieldWords.some((word) => jobWords.has(word));
};

export const isRelevantMatch = ({
  matchPercentage,
  targetJobTitle,
  opportunityTitle,
}) =>
  matchPercentage >= MINIMUM_MATCH_PERCENTAGE &&
  isRelatedTitle(targetJobTitle, opportunityTitle);
