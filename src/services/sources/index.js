
import sampleNigeriaSource from "./sampleNigeria.source.js";

// Only enable sample opportunities for local development.
// Never use demonstration records in production.
export const getOpportunitySources = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const sampleSourceEnabled =
    process.env.OPPORTUNITY_SAMPLE_SOURCE === "true";

  if (!isDevelopment || !sampleSourceEnabled) {
    return [];
  }

  return [sampleNigeriaSource];
};
