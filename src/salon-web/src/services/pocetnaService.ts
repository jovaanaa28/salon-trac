import type { OsnovneInformacije } from '../models/OsnovneInformacije'
import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import type { Usluga } from '../models/Usluga'
import { apiRequest } from './api'

export function getOsnovneInformacije() {
  return apiRequest<OsnovneInformacije>(
    '/api/osnovne-informacije',
  )
}

export function getKategorijeUsluga() {
  return apiRequest<KategorijaUsluge[]>(
    '/api/kategorije-usluga',
  )
}

export function getUsluge() {
  return apiRequest<Usluga[]>(
    '/api/usluge',
  )
}