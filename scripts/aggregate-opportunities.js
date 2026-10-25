import sequelize from "../src/config/database.js";
import { runOpportunityAggregation } from "../src/services/opportunityAggregation.service.js";

try {
  await sequelize.authenticate();
  const result = await runOpportunityAggregation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`Opportunity aggregation failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
