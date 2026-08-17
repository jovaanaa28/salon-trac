import type { Usluga } from '../models/Usluga'
import { apiRequest } from './api'

export type UslugaZahtev = Omit<
  Usluga,
  'id' | 'kategorijaNaziv'
>

export function getUsluge() {
  return apiRequest<Usluga[]>(
    '/api/usluge',
  )
}

export function dodajUslugu(
  zahtev: UslugaZahtev,
) {
  return apiRequest<Usluga>(
    '/api/usluge',
    {
      method: 'POST',
      body: JSON.stringify(zahtev),
    },
  )
}

export function izmeniUslugu(
  id: number,
  zahtev: UslugaZahtev,
) {
  return apiRequest<Usluga>(
    `/api/usluge/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(zahtev),
    },
  )
}

export function obrisiUslugu(
  id: number,
) {
  return apiRequest<void>(
    `/api/usluge/${id}`,
    {
      method: 'DELETE',
    },
  )
}