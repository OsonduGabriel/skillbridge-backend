// Sample records for local development only, not a live opportunity feed.
const sampleOpportunities = [
  {
    externalId: "lagos-fintech-intern-2026",
    title: "Software Engineering Intern",
    company: "Lagos Fintech Labs",
    description:
      "A six-month internship building payment services with a product engineering team in Lagos.",
    type: "internship",
    category: "Software Engineering",
    location: "Lagos, Nigeria",
    workMode: "hybrid",
    applicationUrl: "https://example.com/careers/lagos-fintech-intern-2026",
    requiredSkills: ["JavaScript", "Node.js", "PostgreSQL"],
    preferredSkills: ["Express", "Git"],
  },
  {
    externalId: "abuja-graduate-data-2026",
    title: "Graduate Data Analyst Programme",
    company: "Civic Insights Nigeria",
    description:
      "An entry-level graduate programme supporting public service data projects from Abuja.",
    type: "graduate_program",
    category: "Data Analytics",
    location: "Abuja, Nigeria",
    workMode: "onsite",
    applicationUrl: "https://example.com/careers/abuja-graduate-data-2026",
    requiredSkills: ["SQL", "Python", "Data Visualization"],
    preferredSkills: ["Power BI", "Statistics"],
  },
];

const sampleNigeriaSource = {
  sourceName: "sample-nigeria",
  async fetch() {
    return sampleOpportunities;
  },
  normalize(record) {
    return { ...record };
  },
};

export default sampleNigeriaSource;
