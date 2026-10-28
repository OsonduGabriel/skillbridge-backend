const sanitizePII = (text) => {
  let sanitizedText = text;

  // Remove email addresses
  sanitizedText = sanitizedText.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL REMOVED]"
  );

  // Remove phone numbers
  sanitizedText = sanitizedText.replace(
    /(\+?\d[\d\s().-]{7,}\d)/g,
    "[PHONE REMOVED]"
  );

  // Remove social profile URLs
  sanitizedText = sanitizedText.replace(
    /https?:\/\/(?:www\.)?(?:linkedin\.com|github\.com|twitter\.com|x\.com)\/\S+/gi,
    "[SOCIAL LINK REMOVED]"
  );

  return sanitizedText;
};

export default sanitizePII;