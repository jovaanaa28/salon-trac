import type { TerminiPoKategoriji } from '../models/TerminiPoKategoriji'
import { apiRequest } from './api'

export function getTerminiPoKategoriji() {
  return apiRequest<TerminiPoKategoriji[]>(
    '/api/izvestaji/termini-po-kategoriji',
  )
}