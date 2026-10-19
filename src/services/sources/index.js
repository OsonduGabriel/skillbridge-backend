import sampleNigeriaSource from "./sampleNigeria.source.js";

export const getOpportunitySources = () =>
  process.env.OPPORTUNITY_SAMPLE_SOURCE === "true"
    ? [sampleNigeriaSource]
    : [];
