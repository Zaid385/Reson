

export const CURRENT_SCHEMA_VERSION = 1

export async function runMigrations(projectSchemaVersion: number): Promise<void> {
  // If the project schema is behind the current app schema, apply migrations sequentially.
  // E.g., if projectSchemaVersion === 1 and CURRENT_SCHEMA_VERSION === 2
  // We would run migrateV1toV2()
  
  if (projectSchemaVersion < CURRENT_SCHEMA_VERSION) {
    console.log(`Migrating project from version ${projectSchemaVersion} to ${CURRENT_SCHEMA_VERSION}`)
    
    // Future migrations go here:
    // if (projectSchemaVersion < 2) await migrateV1toV2()
    // if (projectSchemaVersion < 3) await migrateV2toV3()
  }
}
