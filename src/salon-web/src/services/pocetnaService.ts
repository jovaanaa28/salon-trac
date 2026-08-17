import type { Usluga } from '../models/Usluga'
import { apiRequest } from './api'

export {
  getOsnovneInformacije,
} from './osnovneInformacijeService'

export {
  getKategorijeUsluga,
} from './kategorijeService'

export function getUsluge() {
  return apiRequest<Usluga[]>(
    '/api/usluge',
  )
}