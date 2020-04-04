# API Index

This page documents the application programming interface (API), defining the URL endpoints and resources of #WOKEWeekly services.

- [Sessions API](#sessions-api)
- [Candidates API](#candidates-api)
- [Topics API](#topics-api)
- [Members API](#members-api)
- [Reviews API](#reviews-api)
- [Users API](#users-api)
- [Pages API](#pages-api)
- [Suggestions API](#suggestions-api-beta)

# Sessions API

**`GET /api/v1/sessions`**

Returns all sessions.

**Response:**
200 OK

```json
[
    {
        "id": 315,
        "title": "Manchester 2020",
        "dateHeld": "2020-08-29T23:00:00.000Z",
        "timeHeld": "18:00:00",
        "image": "v1585776475/dev/sessions/2020-08-30_manchester-2020.jpg",
        "slug": "manchester-2020",
        "description": "An added description from Postman.",
        "create_time": "2020-04-01T20:27:55.000Z"
    },
    {
      ...
    }
]
```

---

**`GET /api/v1/sessions/{id}`**

Returns the session corresponding to specified ID.

**Response:**
200 OK

```json
{
    "id": 315,
    "title": "Manchester 2020",
    "dateHeld": "2020-08-29T23:00:00.000Z",
    "timeHeld": "18:00:00",
    "image": "v1585776475/dev/sessions/2020-08-30_manchester-2020.jpg",
    "slug": "manchester-2020",
    "description": "An added description from Postman.",
    "create_time": "2020-04-01T20:27:55.000Z"
}
```

---

**`POST /api/v1/sessions`**

Adds a new session.

**Request:**
```json
{
    "session": {
        "title": "Manchester 2020",
        "dateHeld": "2020-01-01",
        "timeHeld": "18:00",
        "description": "An added session.",
        "image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
    }
}
```

**Response:**
201 Created

```json
{
    "id": 101
}
```

---

**`PUT /api/v1/sessions/{id}`**

Updates the session corresponding to the specified ID.

**Request:**
```json
{
    "session": {
        "title": "New Manchester 2021",
        "dateHeld": "2021-12-12",
        "timeHeld": "19:30",
        "description": "An updated session.",
        "image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
    },
    "changed": true
}
```

> If the `changed` field is `true`, the server will attempt to upload the `session.image` to the image cloud service. Otherwise, the server will skip upload.
>
> The `session.image` field is optional if `changed` is `false`.

**Response:**
204 OK

---

**`DELETE /api/v1/sessions/{id}`**

Deletes the session corresponding to the specified ID.

**Response:**
204 No Content

---

**`GET /api/v1/session/featured`**

Returns the featured session, which would be a random upcoming session. If there are not any, returns the latest session to have taken place.

**Response:**
200 OK

---

# Candidates API

**`GET /api/v1/candidates`**

Returns all candidates.

**Response:**
200 OK

---

**`GET /api/v1/candidates/latest`**

Returns the latest candidate.

**Response:**
200 OK

---

**`GET /api/v1/candidates/random`**

Returns a random candidate.

**Response:**
200 OK

---

**`GET /api/v1/candidates/{id}`**

Returns the candidate corresponding to specified ID.

**Response:**
200 OK

---

**`POST /api/v1/candidates/{id}`**

Adds a new candidate with the specified ID.

**Response:**
201 Created

---

**`PUT /api/v1/candidates/{id}`**

Updates the candidate corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/candidates/{id}`**

Deletes the candidate corresponding to the specified ID.

**Response:**
204 No Content

---

# Topics API

**`GET /api/v1/topics`**

Returns all topics.

**Response:**
200 OK

---

**`GET /api/v1/topics/random`**

Returns a random topic.

**Response:**
200 OK

---

**`GET /api/v1/topics/random`**

Returns a random topic.

**`GET /api/v1/topics/{id}`**

Returns the topic corresponding to specified ID.

**Response:**
200 OK

---

**`POST /api/v1/topics`**

Adds a new topic.

**Response:**
201 Created

---

**`PUT /api/v1/topics/{id}`**

Updates the topic corresponding to the specified ID.

**Response:**
200 OK

---

**`PUT /api/v1/topics/{id}/{vote}`**

Increment the topic vote corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/topics/{id}`**

Deletes the topic corresponding to the specified ID.

**Response:**
204 No Content

---

# Members API

**`GET /api/v1/members`**

Returns all members.

**Response:**
200 OK

---

**`GET /api/v1/members/executives`**

Returns only executives.

**Response:**
200 OK

---

**`GET /api/v1/members/{id}`**

Returns the member corresponding to specified ID.

**Response:**
200 OK

---

**`POST /api/v1/members`**

Adds a new member.

**Response:**
201 Created

---

**`PUT /api/v1/members/{id}`**

Updates the member corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/members/{id}`**

Deletes the member corresponding to the specified ID.

**Response:**
204 No Content

---

# Reviews API

**`GET /api/v1/reviews`**

Returns all reviews.

**Response:**
200 OK

---

**`POST /api/v1/reviews`**

Adds a new review.

**Response:**
201 Created

---

**`PUT /api/v1/reviews/{id}`**

Updates the review corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/reviews/{id}`**

Deletes the review corresponding to the specified ID.

**Response:**
204 No Content

---

# Users API

**`GET /api/v1/users`**

Returns all users.

**Response:**
200 OK

---

**`POST /api/v1/users`**

Adds a new user.

**Response:**
201 No Content

---

**`PUT /api/v1/users/{id}`**

Updates the user corresponding to the specified ID.

**Response:**
200 OK

---

# Pages API

**`GET /api/v1/pages`**

Returns all pages.

**Response:**
200 OK

---

**`POST /api/v1/pages`**

Adds a new page.

**Response:**
201 No Content

---

**`PUT /api/v1/pages/{id}`**

Updates the page corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/users/{id}`**

Deletes the page corresponding to the specified ID.

**Response:**
204 No Content

---

# Suggestions API (Beta)

**`GET /api/v1/suggestions`**

Returns all suggestions.

| Name          | Data Type     | Description                     |
| ------------- |:-------------:| ------------------------------- |
| approved      | boolean       | Filters returned suggestions by whether <br/> they are approved or not.

**Response:**
200 OK

---

**`GET /api/v1/suggestions/user/{id}`**

Returns all suggestions made by the user corresponding to the specified ID.

**Response:**
200 OK

---

**`POST /api/v1/suggestions`**

Adds a new suggestion.

**Response:**
201 No Content

---

**`PUT /api/v1/suggestions/{id}/approve`**

Approves the suggestion corresponding to the specified ID.

**Response:**
200 OK

---

**`PUT /api/v1/suggestions/{id}/reject`**

Rejects the suggestion corresponding to the specified ID.

**Response:**
200 OK

---

**`DELETE /api/v1/suggestions/{id}`**

Deletes the suggestion corresponding to the specified ID.

**Response:**
204 No Content

---
