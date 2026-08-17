import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import type { Usluga } from '../models/Usluga'
import { apiRequest } from './api'

export {
  getOsnovneInformacije,
} from './osnovneInformacijeService'

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