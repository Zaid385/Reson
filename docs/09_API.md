**09 — Future Backend API Design (Speculative, Not Implemented in v1)**  
**1. Status & Purpose**  
Reson v1 has **no backend** (03_TDD.md §3.7). This document speculatively designs a REST API to support future cloud-sync, account, and collaboration features (14_FUTURE_FEATURES.md). It exists so that:  
1. The v1 Persistence layer's repository abstraction (08_DATABASE.md §4, §11) is designed with this future shape in mind, avoiding rework.  
2. Whichever team/agent eventually builds the backend has an unambiguous starting contract.  
**Nothing in this document is required for v1 delivery.** No task in 11_IMPLEMENTATION_ROADMAP.md Phases 1–7 depends on it.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUrfDqrYGVDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCQGBEuErVgAAAAASUVORK5CYII=)  
**2. Design Approach**  
**Style:** REST over HTTPS, JSON request/response bodies, resource-oriented URLs, standard HTTP verbs/status codes. (GraphQL was considered and rejected for this API's shape — the resource graph is shallow (Users → Projects → Banks/Pads/Assets) and doesn't benefit meaningfully from GraphQL's query flexibility versus the added client/server complexity; REST keeps the eventual implementation simpler and matches the repository-interface abstraction already established in 08_DATABASE.md.)  
**Authentication (future):** Bearer token (JWT), issued via an OAuth-style flow or magic-link email; exact provider TBD at implementation time. All endpoints below assume Authorization: Bearer <token> unless marked public.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OQQmAUBBAwSeILbyYdDP8jAaxgjcRZhLMNjNntQIA4C/uvTqq6+sJAADvPS2NA0FrXqf/AAAAAElFTkSuQmCC)  
**3. Resource Model**  
erDiagram  
     User ||--o{ Project : owns  
     Project ||--o{ Bank : contains  
     Bank ||--o{ Pad : contains  
     Pad }o--o| Asset : references  
     User ||--o{ Asset : "uploaded (owns storage)"  
     Project ||--o{ Collaborator : "shared with (future collab)"  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhZscZXlheJwqQgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseop8EQrmJduIAAAAASUVORK5CYII=)  
**4. Endpoint Catalogue**  
**4.1 Auth**  
| | | | |  
|-|-|-|-|  
| **Method** | **Path** | **Description** | **Auth** |   
| POST | /v1/auth/signup | Create account | Public |   
| POST | /v1/auth/login | Exchange credentials for token | Public |   
| POST | /v1/auth/refresh | Refresh an expiring token | Public (refresh token) |   
| POST | /v1/auth/logout | Invalidate current token | Bearer |   
   
**4.2 Projects**  
| | | |  
|-|-|-|  
| **Method** | **Path** | **Description** |   
| GET | /v1/projects | List current user's projects (paginated) |   
| POST | /v1/projects | Create a new project |   
| GET | /v1/projects/:projectId | Fetch full project (banks + pads inline, assets as references) |   
| PATCH | /v1/projects/:projectId | Update project metadata (name) |   
| DELETE | /v1/projects/:projectId | Delete project (soft-delete recommended) |   
| PUT | /v1/projects/:projectId/snapshot | Full-state sync push (mirrors ProjectRepository.saveProjectSnapshot) |   
   
**4.3 Banks & Pads**  
| | | |  
|-|-|-|  
| **Method** | **Path** | **Description** |   
| GET | /v1/projects/:projectId/banks | List banks |   
| PATCH | /v1/banks/:bankId | Update bank (e.g., rename) |   
| PATCH | /v1/pads/:padId | Update a single pad's parameters (partial update) |   
| POST | /v1/banks/:bankId/duplicate | Duplicate a bank server-side |   
   
**4.4 Assets**  
| | | |  
|-|-|-|  
| **Method** | **Path** | **Description** |   
| POST | /v1/assets | Request an upload (returns a pre-signed URL for direct-to-object-storage upload, to avoid proxying large binaries through the API server) |   
| POST | /v1/assets/:assetId/complete | Confirm upload completion, trigger server-side waveform-peak generation |   
| GET | /v1/assets/:assetId | Fetch asset metadata + signed playback/download URL |   
| DELETE | /v1/assets/:assetId | Delete asset (subject to reference-count check across the user's projects) |   
   
**4.5 Collaboration (Far-Future, per **14_FUTURE_FEATURES.md **)**  
| | | |  
|-|-|-|  
| **Method** | **Path** | **Description** |   
| POST | /v1/projects/:projectId/collaborators | Invite a collaborator |   
| GET | /v1/projects/:projectId/collaborators | List collaborators |   
| DELETE | /v1/projects/:projectId/collaborators/:userId | Remove collaborator |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**5. Example Contract — **PUT /v1/projects/:projectId/snapshot  
Mirrors the local FullProjectSnapshot shape (08_DATABASE.md §4) directly, so the sync layer is a thin serialization bridge rather than a data-model translation layer.  
**Request body (abridged):**  
{  
   "schemaVersion": 1,  
   "clientUpdatedAt": "2026-07-04T12:00:00Z",  
   "settings": { "masterVolume": 0.8, "masterMute": false },  
   "banks": [ { "index": 0, "name": "Bank A", "pads": [ { "slotIndex": 0, "...": "..." } ] } ]  
 }  
   
**Response (success, ** **200** **):**  
{ "serverUpdatedAt": "2026-07-04T12:00:01Z", "conflict": false }  
   
**Response (conflict, ** **409** **):** returned if clientUpdatedAt predates the server's last-known updatedAt for this project (another device synced more recently). Body includes the server's current snapshot so the client can present a merge/overwrite choice to the user. Conflict resolution UX itself is out of scope for this document and would be specified in a future FSD addendum.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OUQmAABBAsaeI2MKqV8RyJrGCfyJsCbbMzFldAQDwF/dWrdXx9QQAgNf2B/NkAzRb7P0YAAAAAElFTkSuQmCC)  
**6. Rate Limiting & Quotas (Future)**  
- Standard token-bucket rate limiting per user on write endpoints.  
- Per-user storage quota enforced at the /v1/assets upload-request step (checked before issuing a pre-signed upload URL).  
**7. Versioning**  
- URL-path versioning (/v1/...) as shown. Breaking changes ship under /v2/... with the old version supported for a documented deprecation window.  
**8. Non-Functional Expectations (Future)**  
| | |  
|-|-|  
| **Concern** | **Expectation** |   
| Availability | 99.9% target once live |   
| Latency | Metadata endpoints < 200ms p95; asset upload/download latency dominated by object storage, not the API server |   
| Data residency/privacy | User-uploaded audio is private by default; no endpoint in this catalogue exposes another user's assets without an explicit collaboration grant |   
   
This document will be superseded by a dedicated, fully-detailed API specification (likely OpenAPI/Swagger) at the point cloud sync is actually scheduled for implementation.  
