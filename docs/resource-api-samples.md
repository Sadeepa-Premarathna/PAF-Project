# Resource API Samples

Base URL: `http://localhost:8080/api/v1/resources`

## Create Resource

### Request

```http
POST /api/v1/resources
Content-Type: application/json
```

```json
{
  "name": "Engineering Lab A",
  "type": "LAB",
  "capacity": 40,
  "location": "Block B - Floor 2",
  "availableFrom": "08:00",
  "availableTo": "18:00",
  "status": "ACTIVE"
}
```

### Response (201 Created)

```json
{
  "id": 1,
  "name": "Engineering Lab A",
  "type": "LAB",
  "capacity": 40,
  "location": "Block B - Floor 2",
  "availableFrom": "08:00",
  "availableTo": "18:00",
  "status": "ACTIVE"
}
```

## Search / Filter Resources

### Request

```http
GET /api/v1/resources?type=LAB&capacity=30&location=Block%20B
```

### Response (200 OK)

```json
[
  {
    "id": 1,
    "name": "Engineering Lab A",
    "type": "LAB",
    "capacity": 40,
    "location": "Block B - Floor 2",
    "availableFrom": "08:00",
    "availableTo": "18:00",
    "status": "ACTIVE"
  }
]
```

## Update Resource

### Request

```http
PUT /api/v1/resources/1
Content-Type: application/json
```

```json
{
  "name": "Engineering Lab A - Upgraded",
  "type": "LAB",
  "capacity": 45,
  "location": "Block B - Floor 2",
  "availableFrom": "09:00",
  "availableTo": "19:00",
  "status": "ACTIVE"
}
```

### Response (200 OK)

```json
{
  "id": 1,
  "name": "Engineering Lab A - Upgraded",
  "type": "LAB",
  "capacity": 45,
  "location": "Block B - Floor 2",
  "availableFrom": "09:00",
  "availableTo": "19:00",
  "status": "ACTIVE"
}
```

## Delete Resource

### Request

```http
DELETE /api/v1/resources/1
```

### Response (204 No Content)

No response body.

## Validation Error Example

### Request

```json
{
  "name": "",
  "type": "LAB",
  "capacity": 0,
  "location": "",
  "availableFrom": "19:00",
  "availableTo": "08:00",
  "status": "ACTIVE"
}
```

### Response (400 Bad Request)

```json
{
  "timestamp": "2026-04-18T06:03:12.501Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request body",
  "path": "/api/v1/resources",
  "validationErrors": [
    {
      "field": "name",
      "message": "name is required"
    },
    {
      "field": "capacity",
      "message": "capacity must be at least 1"
    },
    {
      "field": "location",
      "message": "location is required"
    }
  ]
}
```
