
import userSchema from "./user.schema.js";
import authSchema from "./auth.schema.js";
import cvSchema from "./cv.schema.js";
import skillGapSchema from "./skill-gap.schema.js";
import skillSchema from "./skill.schema.js";
import roadmapSchema from "./roadmap.schema.js";
import recommendationSchema from "./recommendation.schema.js";
import progressSchema from "./progress.schema.js";
import profileSwaggerSchema from "./profile.schema.js";
import opportunitySchema from "./opportunity.schema.js";
import matchingSchema from "./matching.schema.js";

const schemas = {
  ...userSchema,
  ...authSchema,
  ...cvSchema,
  ...skillGapSchema,
  ...skillSchema,
  ...roadmapSchema,
  ...recommendationSchema,
  ...progressSchema,
  ...profileSwaggerSchema,
  ...opportunitySchema,
  ...matchingSchema
};

export default schemas;
