import type { DozvoljenaValuta } from '../models/DozvoljenaValuta'
import { apiRequest } from './api'

export type ValutaZahtev = Omit<
  DozvoljenaValuta,
  'id'
>

export function getValute() {
  return apiRequest<DozvoljenaValuta[]>(
    '/api/valute',
  )
}

export function dodajValutu(
  zahtev: ValutaZahtev,
) {
  return apiRequest<DozvoljenaValuta>(
    '/api/valute',
    {
      method: 'POST',
      body: JSON.stringify(zahtev),
    },
  )
}

export function izmeniValutu(
  id: number,
  zahtev: ValutaZahtev,
) {
  return apiRequest<DozvoljenaValuta>(
    `/api/valute/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(zahtev),
    },
  )
}

export function obrisiValutu(
  id: number,
) {
  return apiRequest<void>(
    `/api/valute/${id}`,
    {
      method: 'DELETE',
    },
  )
}