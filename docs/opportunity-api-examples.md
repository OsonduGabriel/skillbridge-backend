# Opportunity API examples

Base path: `/api/v1/opportunities`. Add `Authorization: Bearer <token>` to every
request. Admin tokens are required for write and aggregation routes. Replace
`<opportunity-id>` with a UUID returned by the API.

## List and filter

```http
GET /api/v1/opportunities?page=1&limit=10&type=internship&location=Lagos&skill=node.js
Authorization: Bearer <student-token>
```

```json
{
  "success": true,
  "message": "Opportunities retrieved successfully",
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

Invalid query, for example `?page=0`, returns `422`:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "page", "message": "Invalid value" }]
}
```

## Read one

```http
GET /api/v1/opportunities/<opportunity-id>
Authorization: Bearer <student-token>
```

```json
{
  "success": true,
  "message": "Opportunity retrieved successfully",
  "data": {
    "id": "<opportunity-id>",
    "title": "Software Engineering Intern",
    "company": "Example Company",
    "type": "internship",
    "status": "active",
    "requiredSkills": ["javascript", "node.js"]
  }
}
```

A valid UUID with no matching row returns `404`:

```json
{ "success": false, "message": "Opportunity not found" }
```

## Create

```http
POST /api/v1/opportunities
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "title": "Software Engineering Intern",
  "company": "Example Company",
  "description": "Build services with the product team.",
  "type": "internship",
  "category": "Software Engineering",
  "location": "Lagos, Nigeria",
  "workMode": "hybrid",
  "applicationUrl": "https://example.com/careers/intern",
  "deadline": "2026-12-01T00:00:00.000Z",
  "requiredSkills": ["JavaScript", "Node.js"],
  "preferredSkills": ["PostgreSQL"]
}
```

Returns `201` with the created row in `data`:

```json
{
  "success": true,
  "message": "Opportunity created successfully",
  "data": { "id": "<opportunity-id>", "status": "active", "source": "manual" }
}
```

Invalid fields return `422` with `errors`; a non-admin returns `403`:

```json
{ "success": false, "message": "Access denied. You do not have permission to perform this action" }
```

## Update

```http
PATCH /api/v1/opportunities/<opportunity-id>
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{ "status": "closed", "requiredSkills": ["Node.js", "PostgreSQL"] }
```

Returns `200` with the updated row in `data`. Empty or invalid update bodies
return `422`; a missing row returns `404`:

```json
{ "success": false, "message": "Opportunity not found" }
```

## Delete

```http
DELETE /api/v1/opportunities/<opportunity-id>
Authorization: Bearer <admin-token>
```

```json
{ "success": true, "message": "Opportunity deleted successfully", "data": null }
```

A missing row returns `404`; a non-admin returns `403`.

## Aggregate sources

```http
POST /api/v1/opportunities/aggregate
Authorization: Bearer <admin-token>
```

```json
{
  "success": true,
  "message": "Opportunity aggregation completed",
  "data": {
    "processed": 2,
    "sources": [{ "sourceName": "sample-nigeria", "processed": 2 }],
    "expired": 0
  }
}
```

An adapter failure is isolated and reported for that source while other source
results remain present:

```json
{
  "success": true,
  "message": "Opportunity aggregation completed",
  "data": {
    "processed": 2,
    "sources": [
      { "sourceName": "failed-source", "processed": 0, "error": "Provider unavailable" },
      { "sourceName": "sample-nigeria", "processed": 2 }
    ],
    "expired": 0
  }
}
```

A non-admin receives `403`. Every endpoint without a token returns `401`, for
example:

```json
{ "success": false, "message": "Not authorized. No token provided" }
```
