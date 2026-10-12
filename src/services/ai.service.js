const analyzeCVWithAI = async (analysisData) => {
  // AI team will provide the integration logic here.
  console.log("Sending cv text to ai service", analysisData)
  return {
    cvId: analysisData.cvId,
    analysis: null,
  };
};

export { analyzeCVWithAI };