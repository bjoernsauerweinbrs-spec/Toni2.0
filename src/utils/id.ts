// toni/src/utils/id.ts

// Falls du später UUIDs aus einer Library nutzt, kannst du das hier ersetzen.
// Diese Funktion erzeugt eine einfache eindeutige ID.

export function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 11);
}
