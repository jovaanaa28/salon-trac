import type {
  RezervacijePoDatumu,
} from '../models/RezervacijePoDatumu'

import type {
  TerminiPoKategoriji,
} from '../models/TerminiPoKategoriji'

import { apiRequest } from './api'

export function getTerminiPoKategoriji() {
  return apiRequest<TerminiPoKategoriji[]>(
    '/api/izvestaji/termini-po-kategoriji',
  )
}

export function getRezervacijePoDatumu() {
  return apiRequest<RezervacijePoDatumu[]>(
    '/api/izvestaji/rezervacije-po-datumu',
  )
}