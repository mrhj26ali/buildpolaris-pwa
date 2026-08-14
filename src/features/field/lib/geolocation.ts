// UC-6.1's own sequence diagram: photo capture optionally tags GPS coordinates
// at time of capture. Geolocation is opportunistic — a missing/denied
// permission must never block the underlying write (FR-6.5's "never silently
// dropped" is about the record itself, not about GPS metadata on it).
export interface CapturedCoordinates {
  latitude: number | null
  longitude: number | null
}

export function getCurrentCoordinates(): Promise<CapturedCoordinates> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ latitude: null, longitude: null })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve({ latitude: null, longitude: null }),
      { timeout: 5000, maximumAge: 60000 },
    )
  })
}
