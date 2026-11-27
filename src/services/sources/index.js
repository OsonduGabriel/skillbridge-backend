
import sampleNigeriaSource from "./sampleNigeria.source.js";

// Return the opportunity source adapters enabled for this environment.
export const getOpportunitySources = () => {
  const nodeEnvironment = process.env.NODE_ENV;

  // Treat an unset NODE_ENV as local development.
  const isDevelopment =
    !nodeEnvironment ||
    nodeEnvironment === "development";

  const sampleSourceEnabled =
    process.env.OPPORTUNITY_SAMPLE_SOURCE === "true";

  const sources = [];

  // Demonstration data must never be enabled in production.
  if (isDevelopment && sampleSourceEnabled) {
    sources.push(sampleNigeriaSource);
  }

  // Register real external provider adapters here when implemented.
  //
  // Example:
  // sources.push(adzunaSource);
  // sources.push(remotiveSource);

  return sources;
};
