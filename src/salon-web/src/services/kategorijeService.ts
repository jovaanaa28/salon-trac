import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import { apiRequest } from './api'

export function getKategorijeUsluga() {
  return apiRequest<KategorijaUsluge[]>(
    '/api/kategorije-usluga',
  )
}

export function dodajKategoriju(
  naziv: string,
) {
  return apiRequest<KategorijaUsluge>(
    '/api/kategorije-usluga',
    {
      method: 'POST',
      body: JSON.stringify({
        naziv,
      }),
    },
  )
}

export function izmeniKategoriju(
  id: number,
  naziv: string,
) {
  return apiRequest<KategorijaUsluge>(
    `/api/kategorije-usluga/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        naziv,
      }),
    },
  )
}

export function obrisiKategoriju(
  id: number,
) {
  return apiRequest<void>(
    `/api/kategorije-usluga/${id}`,
    {
      method: 'DELETE',
    },
  )
}