export interface Geotag {
  lat: number
  lng: number
  accuracy?: number
  captured_at: string
}

export interface CameraCapture {
  blob: Blob
  dataUrl?: string
  captured_at: string
}

export async function geotagCurrentLocation(): Promise<Geotag> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not available in this browser.')
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          captured_at: new Date(position.timestamp).toISOString(),
        })
      },
      (error) => reject(new Error(error.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })
}

export async function capturePhoto(): Promise<CameraCapture> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access is not supported in this browser.')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false,
  })

  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  await video.play()

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720

  const context = canvas.getContext('2d')
  if (!context) {
    stream.getTracks().forEach((track) => track.stop())
    throw new Error('Could not create a canvas context for the photo capture.')
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error('The photo could not be captured.'))
        return
      }
      resolve(value)
    }, 'image/jpeg', 0.9)
  })

  stream.getTracks().forEach((track) => track.stop())

  return {
    blob,
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    captured_at: new Date().toISOString(),
  }
}

