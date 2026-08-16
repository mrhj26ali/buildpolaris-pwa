// RxDB 17's RxDocument.toJSON() intentionally returns a DeepReadonlyObject<T>
// to prevent accidental in-place mutation of RxDB's internal document cache.
// That's the correct default, but every repository/hook in lib/db and
// features/field/model re-exports these as ordinary mutable T (React state
// setters, function return types) once the data has left RxDB's own
// document object — at that point it's a plain JS value the rest of the app
// owns outright, so re-asserting mutability here is intentional, not a type
// hole. Centralizing the cast in one named helper (rather than scattering
// `as unknown as T` at each call site) keeps every one of these casts
// visible and greppable in one place if RxDB's typing ever changes.
export function toMutable<T>(doc: T): T {
  return doc as T
}
