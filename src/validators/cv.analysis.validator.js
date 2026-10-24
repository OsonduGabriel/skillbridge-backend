const validateCVAnalysisInput = ({ targetJobTitle, industryFocus, careerStage, primaryGoal}) => {
        const errors = [];

        const allowedCareerStages = [
            "Student",
            "Entry",
            "Mid",
            "Senior",
            "Pivot",
         ];

        const allowedGoals = [
            "CV Review",
            "Gap Analysis",
            "Roadmap",
        ];

  if (!careerStage) {
    errors.push("Career stage is required.");
  } else if (!allowedCareerStages.includes(careerStage)) {
    errors.push("Invalid career stage.");
  }

  if (!primaryGoal) {
    errors.push("Primary goal is required.");
  } else if (!allowedGoals.includes(primaryGoal)) {
    errors.push("Invalid primary goal.");
  }

  if (targetJobTitle && typeof targetJobTitle !== "string") {
    errors.push("Target job title must be a string.");
  }

  if (industryFocus && typeof industryFocus !== "string") {
    errors.push("Industry focus must be a string.");
  }

  return errors;
};

export default validateCVAnalysisInput;