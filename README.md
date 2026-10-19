# Opportunity aggregation

`aggregateOpportunities` accepts source adapters; no source is enabled by default.
Each adapter provides a unique `sourceName`, `fetch()` to return its raw records,
and `normalize(record)` to return an opportunity with `externalId`, `title`,
`company`, `description`, `type`, and `applicationUrl`. Optional normalized
fields are `category`, `location`, `workMode`, and `deadline`.
Skill names are optional `requiredSkills` and `preferredSkills` arrays; names
are normalized to lowercase and duplicates are removed.

```js
import { aggregateOpportunities } from "./src/services/opportunityAggregation.service.js";

const source = {
  sourceName: "approved-provider",
  fetch: () => providerClient.getOpportunities(),
  normalize: (record) => ({
    externalId: String(record.id),
    title: record.position,
    company: record.employer,
    description: record.description,
    type: "job",
    applicationUrl: record.applyUrl,
    requiredSkills: ["Node.js", "PostgreSQL"],
  }),
};

const result = await aggregateOpportunities([source]);
```

Records are upserted on `sourceName` and `externalId`; each source's batch is
transactional. Provider access, scheduling, and source approval remain the
caller's responsibility.

## Opportunity API

The API is mounted at `/api/v1/opportunities`. All endpoints require a bearer
token. Creating, updating, deleting, and aggregating opportunities require the
`admin` role. The authenticated routes support listing and filtering, reading
one opportunity, and admin-managed CRUD.

Aggregation is opt-in. Set `OPPORTUNITY_SAMPLE_SOURCE=true` to include the
clearly labelled Nigerian sample source. Set `OPPORTUNITY_STALE_AFTER_DAYS` to
the number of days without a source sighting before aggregated opportunities
expire. The default is `14`. Aggregation can be triggered by an admin with
`POST /api/v1/opportunities/aggregate` or run with:

```sh
node scripts/aggregate-opportunities.js
```

See [docs/opportunity-api-examples.md](docs/opportunity-api-examples.md) for
request and response examples and
[docs/opportunity.postman_collection.json](docs/opportunity.postman_collection.json)
for a Postman collection. Local startup also requires a configured PostgreSQL
database and `JWT_SECRET`.
