import type { OsnovneInformacije } from '../models/OsnovneInformacije'
import { apiRequest } from './api'

export function getOsnovneInformacije() {
  return apiRequest<OsnovneInformacije>(
    '/api/osnovne-informacije',
  )
}

export function sacuvajOsnovneInformacije(
  podaci: OsnovneInformacije,
) {
  return apiRequest<OsnovneInformacije>(
    '/api/osnovne-informacije',
    {
      method: 'PUT',
      body: JSON.stringify(podaci),
    },
  )
}