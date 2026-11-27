
const sampleOpportunities = [
  {
    externalId: "lagos-fintech-intern-2026",

    title: "Software Engineering Intern",

    company: "Lagos Fintech Labs",

    description:
      "A demonstration internship record for testing the SkillBridge opportunity aggregation system. This is not a verified vacancy.",

    type: "internship",

    category: "Software Engineering",

    location: "Lagos, Nigeria",

    workMode: "hybrid",

    applicationUrl:
      "https://example.com/careers/lagos-fintech-intern-2026",

    requiredSkills: [
      "JavaScript",
      "Node.js",
      "PostgreSQL",
    ],

    preferredSkills: [
      "Express",
      "Git",
    ],

    deadline: null,
  },

  {
    externalId: "abuja-graduate-data-2026",

    title: "Graduate Data Analyst Programme",

    company: "Civic Insights Nigeria",

    description:
      "A demonstration graduate programme record for testing the SkillBridge opportunity aggregation system. This is not a verified vacancy.",

    type: "graduate_program",

    category: "Data Analytics",

    location: "Abuja, Nigeria",

    workMode: "onsite",

    applicationUrl:
      "https://example.com/careers/abuja-graduate-data-2026",

    requiredSkills: [
      "SQL",
      "Python",
      "Data Visualization",
    ],

    preferredSkills: [
      "Power BI",
      "Statistics",
    ],

    deadline: null,
  },
];

const sampleNigeriaSource = {
  sourceName: "sample-nigeria",

  // Return demonstration records.
  //
  // completeSnapshot is true because this adapter returns
  // its entire fixed demonstration dataset.
  async fetch() {
    return {
      records: sampleOpportunities,
      completeSnapshot: true,
    };
  },

  // The sample records already follow the normalized
  // opportunity structure.
  normalize(record) {
    return { ...record };
  },
};

export default sampleNigeriaSource;
