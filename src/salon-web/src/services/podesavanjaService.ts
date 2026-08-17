import type { DatumPopusta } from '../models/DatumPopusta'
import { apiRequest } from './api'

export function getDatumPopusta() {
  return apiRequest<DatumPopusta>(
    '/api/podesavanja/datum-popusta',
  )
}

export function sacuvajDatumPopusta(
  datumDoKadaVaziPopust: string | null,
) {
  return apiRequest<DatumPopusta>(
    '/api/podesavanja/datum-popusta',
    {
      method: 'PUT',
      body: JSON.stringify({
        datumDoKadaVaziPopust,
      }),
    },
  )
}