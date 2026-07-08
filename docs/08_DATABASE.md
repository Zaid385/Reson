**08 — Local Persistence Schema (IndexedDB / Dexie.js)**  
**1. Purpose**  
Reson persists all user data locally via IndexedDB, accessed through Dexie.js. This document defines the database name, object stores, indexes, TypeScript record shapes, versioning/migration strategy, storage-size management, and the project export/import file format.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj5fFgpQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTRBeEgNK9YAAAAAElFTkSuQmCC)  
**2. Database Definition**  
**Database name:** Reson-db  
   
 **Current schema version:** 1  
erDiagram  
     projects ||--o{ banks : "projectId"  
     banks ||--o{ pads : "bankId"  
     pads }o--o| assets : "assetId"  
     projects ||--|| settings : "singleton per project"  
   
     projects {  
         string id PK  
         string name  
         number schemaVersion  
         number createdAt  
         number updatedAt  
         boolean isActive  
     }  
     banks {  
         string id PK  
         string projectId FK  
         number index  
         string name  
     }  
     pads {  
         string id PK  
         string bankId FK  
         number slotIndex  
         string assetId FK  
         string displayName  
         string color  
         float volume  
         float pan  
         float pitchSemitones  
         boolean reverse  
         float attackMs  
         float releaseMs  
         boolean mute  
         boolean solo  
         string playMode  
        float startMarker  
         float endMarker  
         boolean loop  
         float fadeInMs  
         float fadeOutMs  
         float gainDb  
         boolean normalizeApplied  
         string chokeGroup  
         number updatedAt  
     }  
     assets {  
         string id PK  
         string name  
         string sourceType  
         blob audioData  
         string mimeType  
         number durationSeconds  
         json waveformPeaksLow  
         json waveformPeaksHigh  
         number refCount  
         number createdAt  
         number fileSizeBytes  
     }  
     settings {  
         string projectId PK  
         float masterVolume  
         boolean masterMute  
         boolean confirmBeforeReplace  
         string keyboardMappingMode  
         string themeDensity  
         boolean hasSeenOnboarding  
     }  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhQAQ60PcrIhnxgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseS14EKxPCORkAAAAASUVORK5CYII=)  
**3. Object Stores (Dexie Table Definitions)**  
**3.1 **projects  
| | | |  
|-|-|-|  
| **Field** | **Type** | **Notes** |   
| id | string (UUID) | Primary key |   
| name | string | User-facing project name, default "My Kit" |   
| schemaVersion | number | Written at save time, used for migration detection |   
| createdAt | number (epoch ms) |   |   
| updatedAt | number (epoch ms) | Updated on every autosave |   
| isActive | boolean | True for the currently-loaded project (only one at a time in v1; supports FR-PERSIST-004 multi-project future use) |   
   
**Indexes:** id (PK), isActive, updatedAt.  
**3.2 **banks  
| | | |  
|-|-|-|  
| **Field** | **Type** | **Notes** |   
| id | string (UUID) | Primary key |   
| projectId | string | FK → projects.id |   
| index | number | 0-3, maps to A/B/C/D |   
| name | string | Default "Bank A" etc., user-editable |   
   
**Indexes:** id (PK), projectId, compound [projectId+index] (unique per project).  
**3.3 **pads  
| | | |  
|-|-|-|  
| **Field** | **Type** | **Notes** |   
| id | string (deterministic: ${bankId}:${slotIndex}) | Primary key |   
| bankId | string | FK → banks.id |   
| slotIndex | number | 0-31 |   
| assetId | string \| null | FK → assets.id, null if unassigned |   
| displayName | string | Max 32 chars |   
| color | string (hex) |   |   
| volume | number | 0.0–1.0, default 0.8 |   
| pan | number | -1.0–1.0, default 0 |   
| pitchSemitones | number | -24–24, default 0 |   
| reverse | boolean | default false |   
| attackMs | number | default 0 |   
| releaseMs | number | default 50 |   
| mute | boolean | default false |   
| solo | boolean | default false |   
| playMode | 'oneshot' \| 'gate' | default 'oneshot' |   
| startMarker | number | 0.0–1.0, default 0 |   
| endMarker | number | 0.0–1.0, default 1 |   
| loop | boolean | default false |   
| fadeInMs | number | default 0 |   
| fadeOutMs | number | default 0 |   
| gainDb | number | -24–12, default 0 |   
| normalizeApplied | boolean | default false |   
| chokeGroup | string \| null | reserved for future use (FR-PAD-006), default null |   
| updatedAt | number | epoch ms |   
   
**Indexes:** id (PK), bankId, compound [bankId+slotIndex] (unique), assetId.  
**Note:** All 32 pad records for a bank are created eagerly (even when unassigned, assetId: null) at bank-creation time, rather than lazily on first assignment — simplifies queries (FR-BANK-001 always has exactly 32 rows per bank) and matches the Engine's eager Pad Bus allocation (07_AUDIO_ENGINE.md §13).  
**3.4 **assets  
| | | |  
|-|-|-|  
| **Field** | **Type** | **Notes** |   
| id | string (UUID) | Primary key |   
| name | string | Original filename or built-in sample name |   
| sourceType | 'built-in' \| 'user-upload' |   |   
| audioData | Blob | Raw audio file bytes |   
| mimeType | string | e.g. audio/wav |   
| durationSeconds | number | Cached from decode |   
| waveformPeaksLow | number[] (JSON) | Downsampled peaks for pad thumbnails (~64 points) |   
| waveformPeaksHigh | number[] (JSON) | Higher-resolution peaks for the Sample Editor (~2000 points, or tiered/zoom-dependent — see §6) |   
| refCount | number | Count of pads currently referencing this asset; used for safe deletion (FR-SAMPLE-005) |   
| createdAt | number | epoch ms |   
| fileSizeBytes | number | For storage usage reporting |   
   
**Indexes:** id (PK), sourceType, name.  
**Built-in samples** are NOT duplicated into IndexedDB on first load — they are shipped as static assets (see 10_PROJECT_STRUCTURE.md /public/samples/) and referenced via a stable, hardcoded sourceType: 'built-in' asset catalog loaded from a static JSON manifest at boot. An assets row IS still created for a built-in sample the moment a user assigns it to a pad and/or edits it (e.g., a user trims a built-in kick — the trim/edit parameters live on the pads row regardless; the assets row for built-ins may be a lightweight reference-only record pointing at the static URL rather than storing a duplicate Blob, to save space — see §7).  
**3.5 **settings  
| | | |  
|-|-|-|  
| **Field** | **Type** | **Notes** |   
| projectId | string | Primary key (1:1 with projects) |   
| masterVolume | number | 0.0–1.0, default 0.8 |   
| masterMute | boolean | default false |   
| confirmBeforeReplace | boolean | default true |   
| keyboardMappingMode | 'physical' \| 'printed' | default 'physical' |   
| themeDensity | 'compact' \| 'comfortable' | default 'comfortable' |   
| hasSeenOnboarding | boolean | default false |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**4. Repository Interfaces (Domain-Facing Abstraction)**  
Per 04_ARCHITECTURE.md §2.6, only the Domain Services layer touches Dexie directly, through typed repositories:  
interface ProjectRepository {  
   getActiveProject(): Promise<ProjectRecord | null>;  
   createDefaultProject(): Promise<ProjectRecord>;  
   saveProjectSnapshot(snapshot: FullProjectSnapshot): Promise<void>; // used by autosave, transactional across banks/pads/settings  
   listProjects(): Promise<ProjectRecord[]>; // for FR-PERSIST-004  
   setActiveProject(projectId: string): Promise<void>;  
   deleteProject(projectId: string): Promise<void>;  
 }  
   
 interface AssetRepository {  
   saveAsset(data: Blob, metadata: AssetMetadata): Promise<string>; // returns assetId  
   getAsset(assetId: string): Promise<AssetRecord | null>;  
   incrementRefCount(assetId: string): Promise<void>;  
   decrementRefCount(assetId: string): Promise<void>; // deletes record when refCount reaches 0 AND sourceType === 'user-upload'  
   getStorageEstimate(): Promise<{ usage: number; quota: number }>;  
 }  
   
 interface PadRepository {  
   getPadsForBank(bankId: string): Promise<PadRecord[]>;  
   updatePad(padId: string, changes: Partial<PadRecord>): Promise<void>;  
   bulkUpdatePads(updates: Array<{ padId: string; changes: Partial<PadRecord> }>): Promise<void>; // for bank duplication  
 }  
   
FullProjectSnapshot is the complete serializable state tree matching the Zustand store's persisted slices (project + banks + pads + settings), written in a single Dexie transaction to guarantee atomicity of autosave (no partial-write corruption if the tab closes mid-save).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OsQ1AABRAwSdRaPXGMOCv7WkPK+hEcjfBLTNzVFcAAPzFvVZbdX49AQDgtf0BSpoDXv5TGXgAAAAASUVORK5CYII=)  
**5. Schema Versioning & Migration Strategy**  
- Dexie's native versioning (db.version(N).stores({...})) is used for structural (index/table) changes.  
- A separate **application-level ** **schemaVersion** field on the projects record tracks data-shape migrations that don't require new Dexie indexes (e.g., adding a new pad parameter with a default value).  
- On load, ProjectRepository.getActiveProject() checks project.schemaVersion against the current app-expected version (CURRENT_SCHEMA_VERSION constant in /src/persistence/migrations.ts) and runs an ordered list of pure migration functions (migrateV1toV2, etc.) if behind, before returning data to the Domain layer. Each migration function is additive-only where possible (new fields with defaults) to minimize data-loss risk.  
- Migrations are logged (console/debug logger) and are idempotent-safe (re-running a migration on already-migrated data is a no-op, checked via version comparison, not by re-detecting field presence).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAMUlEQVR4nO3WAQkAIBAEsBPMYs4PZhMDWMAA5njYUmxU1UqyAwBAF2cmeZE4AIBO7gentgXapSWpbgAAAABJRU5ErkJggg==)  
**6. Waveform Peaks Storage Strategy**  
To balance editor precision against storage bloat:  
- waveformPeaksLow (~64 points): used for PadWaveformThumbnail (§06_COMPONENTS.md), always computed and stored at upload time.  
- waveformPeaksHigh (~2000 points, or min(2000, sampleLengthInSamples / 256)): used as the base resolution for the Sample Editor's WaveformCanvas; WaveSurfer.js performs further client-side interpolation/rendering for zoom levels beyond this base resolution (v1 does not store per-zoom-level peak tiers — acceptable given typical sample lengths for a performance sampler are short, seconds not minutes; see 13_RISK_ANALYSIS.md for the risk/mitigation if very long samples become common).  
- Both are stored as plain JSON number arrays (Dexie supports structured cloning of arrays natively) rather than as a separate Blob, keeping them queryable/inspectable and simplifying the export format (§8).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EjtY9fewnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzWAM6QQXRdAAAAABJRU5ErkJggg==)  
**7. Built-In Sample Assets — Storage Optimization**  
Built-in sample packs ship as static files under /public/samples/<pack-name>/<sample-name>.wav plus a manifest /public/samples/manifest.json describing pack metadata (name, sample list, pre-computed peaks bundled directly in the manifest to avoid a decode-and-analyze step on first app load).  
When a user assigns a built-in sample to a pad, the pads.assetId may point either to:  
   
 (a) a **virtual asset ID** resolved directly against the static manifest (no assets table row needed) for the common case of an untouched built-in sample, OR  
   
 (b) a real assets table row (with sourceType: 'built-in', audioData populated from a fetch of the static file) created lazily the first time the user performs an operation requiring a mutable local copy (e.g., opens the Sample Editor and makes ANY edit to it, or the app needs to reverse it — since a reversed buffer must be cached, per 07_AUDIO_ENGINE.md §8).  
This keeps the common "just play the built-in kit" path storage-free while still supporting full editability.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBACPiUML0NpGACyywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AL/SBEZwuCSwAAAAAElFTkSuQmCC)  
**8. Project Export / Import File Format**  
**8.1 Export**  
FR-IO-001 produces a single downloadable file: **<project-name>.Reson.json** (a JSON container; audio Blobs are base64-encoded inline for portability, accepting the size tradeoff for v1 simplicity over a zip-based multi-file format).  
{  
   "formatVersion": 1,  
   "exportedAt": "2026-07-04T12:00:00Z",  
   "project": {  
     "name": "My Kit",  
     "schemaVersion": 1  
   },  
   "settings": { "masterVolume": 0.8, "masterMute": false, "...": "..." },  
   "banks": [  
     {  
       "index": 0,  
       "name": "Bank A",  
       "pads": [  
         {  
           "slotIndex": 0,  
           "displayName": "Kick Deep",  
           "color": "#7C5CFF",  
           "volume": 0.85,  
           "pan": 0,  
           "pitchSemitones": 0,  
           "playMode": "oneshot",  
           "startMarker": 0.0,  
           "endMarker": 1.0,  
           "...": "... all other pad fields ...",  
           "assetRef": "asset-uuid-1"  
         }  
       ]  
     }  
   ],  
   "assets": [  
     {  
       "id": "asset-uuid-1",  
       "name": "kick_deep.wav",  
       "mimeType": "audio/wav",  
       "durationSeconds": 0.8,  
       "waveformPeaksLow": [/* ... */],  
       "waveformPeaksHigh": [/* ... */],  
       "audioDataBase64": "UklGRi...=="  
     }  
   ]  
 }  
   
**Note:** built-in-sourced, never-edited samples are exported by *reference* (sourceType: "built-in-ref", "builtInId": "acoustic-kit/kick-deep") rather than inlining their audio data, keeping export files small for the common case; only user uploads or edited built-ins embed audioDataBase64.  
**8.2 Import**  
FR-IO-002 validates: formatVersion is recognized (with a defined mapping of how older format versions are upcast, mirroring §5's migration approach), all referenced assetRefs resolve within the file, and total decoded size is within a sane bound (warn if very large). The user is then prompted: **Replace current project** (destructive, confirmed) or  **Import as new project** (added to the local project list, FR-PERSIST-004).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCkJfFSqwwIgHRiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AOH8BeZxN/IIAAAAAElFTkSuQmCC)  
**9. Storage Quota Management**  
- On each successful autosave, and periodically (e.g., every 60s while the app is open), the app calls navigator.storage.estimate() and updates StorageIndicator (06_COMPONENTS.md §11.2).  
- If usage / quota > 0.9, a persistent warning toast is shown (FR-PERSIST-002, FR-ERROR-002) directing the user to Settings, where they can see per-asset size breakdown and delete unused user-uploaded samples.  
- Where supported, navigator.storage.persist() is requested (best-effort, not guaranteed) to reduce the likelihood of browser-initiated eviction of the IndexedDB data under storage pressure.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EEtY9QcxnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzXgM37EF77AAAAABJRU5ErkJggg==)  
**10. Concurrency & Consistency**  
- All multi-table writes (e.g., "replace sample" which touches pads + assets.refCount) are wrapped in a single Dexie transaction('rw', [pads, assets], async () => {...}) block to prevent partial-state corruption.  
- The app assumes a **single tab** is the primary editor of a project at a time in v1 (no multi-tab sync/locking is implemented); opening the app in two tabs simultaneously is a documented known limitation (13_RISK_ANALYSIS.md) — last-write-wins on autosave if both tabs are active, which is acceptable for a local-first single-user v1 product.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNhRAF6EPYDLhGADSywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AIWsBDYDm5cLAAAAAElFTkSuQmCC)  
**11. Future Cloud Sync Considerations (Non-Binding for v1)**  
See 09_API.md and 14_FUTURE_FEATURES.md for the speculative backend design. At the schema level, forward-compatibility is preserved by:  
- Every table already includes id fields as UUIDs (not auto-increment integers), suitable for merge/sync without ID collisions across devices.  
- updatedAt timestamps exist on all mutable records, suitable for last-write-wins or conflict-detection sync strategies later.  
- The ProjectRepository interface (§4) is already abstracted such that a future RemoteProjectRepository (calling the API in 09_API.md) can implement the same interface, allowing the Domain layer to remain unchanged when cloud sync is introduced.  
