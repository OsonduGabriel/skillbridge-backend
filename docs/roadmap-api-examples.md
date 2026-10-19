# Career Roadmap API examples

Base path: `/api/v1/roadmaps`. Every route requires
`Authorization: Bearer <token>`. Roadmap and task access is scoped to the
authenticated user. Replace the UUID placeholders with values from your
environment.

## Generate a roadmap

```http
POST /api/v1/roadmaps/generate
Authorization: Bearer <student-token>
Content-Type: application/json
```

```json
{ "skillGapId": "<owned-skill-gap-uuid>" }
```

The route verifies that the skill gap belongs to the caller. It currently
returns `503` because AI provider integration is deferred until the team selects
a provider:

```json
{
  "success": false,
  "message": "Roadmap generation is unavailable until an AI provider is selected"
}
```

An unowned or missing skill gap returns `404` with `"Skill gap not found"`.

## List roadmaps

```http
GET /api/v1/roadmaps
Authorization: Bearer <student-token>
```

```json
{ "success": true, "message": "Roadmaps retrieved successfully", "data": { "items": [] } }
```

## Read a roadmap

```http
GET /api/v1/roadmaps/<roadmap-id>
Authorization: Bearer <student-token>
```

```json
{
  "success": true,
  "message": "Roadmap retrieved successfully",
  "data": {
    "id": "<roadmap-id>",
    "skillGapId": "<skill-gap-id>",
    "title": "Backend Engineer Roadmap",
    "targetRole": "Backend Engineer",
    "summary": "Build the skills and project experience for the target role.",
    "status": "active",
    "generatedBy": "ai",
    "tasksByPhase": {
      "30": [],
      "60": [],
      "90": []
    }
  }
}
```

Other users' roadmaps return `404` with `"Roadmap not found"`.

## Update a roadmap

```http
PATCH /api/v1/roadmaps/<roadmap-id>
Authorization: Bearer <student-token>
Content-Type: application/json
```

```json
{ "title": "Backend Engineering Plan", "status": "active" }
```

Returns `200` with the updated roadmap in `data`. Empty bodies and invalid
status values return `422`. A roadmap owned by another user returns `404`.

## Delete a roadmap

```http
DELETE /api/v1/roadmaps/<roadmap-id>
Authorization: Bearer <student-token>
```

```json
{ "success": true, "message": "Roadmap deleted successfully", "data": null }
```

Deleting a roadmap cascades to its tasks. Another user's roadmap returns `404`.

## Add a task

```http
POST /api/v1/roadmaps/<roadmap-id>/tasks
Authorization: Bearer <student-token>
Content-Type: application/json
```

```json
{
  "phase": 30,
  "title": "Practice PostgreSQL joins",
  "description": "Complete a practical exercise using relational joins.",
  "taskType": "practice",
  "skill": "postgresql",
  "estimatedHours": 3
}
```

Returns `201` with the created task in `data`. The phase must be `30`, `60`, or
`90`. A non-null skill must be in the linked skill gap's `missingSkills` array.
Invalid phase or skill returns `422`; an unowned roadmap returns `404`.

## Update a task

```http
PATCH /api/v1/roadmaps/<roadmap-id>/tasks/<task-id>
Authorization: Bearer <student-token>
Content-Type: application/json
```

```json
{ "status": "done" }
```

Returns `200` with the updated task. Setting status to `done` sets
`completedAt`; changing it to another status clears `completedAt`. Invalid
phase, status, or skill returns `422`. A task or roadmap outside the caller's
ownership returns `404`.

## Delete a task

```http
DELETE /api/v1/roadmaps/<roadmap-id>/tasks/<task-id>
Authorization: Bearer <student-token>
```

```json
{ "success": true, "message": "Roadmap task deleted successfully", "data": null }
```

A task or roadmap outside the caller's ownership returns `404`.

## Authentication and validation errors

Every route without a token returns `401`:

```json
{ "success": false, "message": "Not authorized. No token provided" }
```

Invalid request data returns `422`:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "phase", "message": "Invalid value" }]
}
```
