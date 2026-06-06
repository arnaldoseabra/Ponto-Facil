import { useState, useCallback } from 'react'

interface GPSState {
  lat: number | null
  lng: number | null
  locationName: string
  loading: boolean
  error: string | null
}

export function useGPS() {
  const [state, setState] = useState<GPSState>({
    lat: null,
    lng: null,
    locationName: 'Localização não detectada',
    loading: false,
    error: null,
  })

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        lat: -23.5505,
        lng: -46.6333,
        locationName: 'Av. Paulista, 1000 — São Paulo (Demo)',
        error: null,
      }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setState({
          lat: latitude,
          lng: longitude,
          locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          loading: false,
          error: null,
        })
      },
      () => {
        setState({
          lat: -23.5505,
          lng: -46.6333,
          locationName: 'Av. Paulista, 1000 — São Paulo (Demo)',
          loading: false,
          error: null,
        })
      },
      { timeout: 5000, enableHighAccuracy: true }
    )
  }, [])

  return { ...state, getLocation }
}
