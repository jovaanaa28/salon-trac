import type { Termin } from '../models/Termin' 

import { apiRequest } from './api' 

 

export function getDostupneTermine( 

  uslugaId: number, 

  datum: string, 

) { 

  return apiRequest<Termin[]>( 

    `/api/termini/usluga/${uslugaId}?datum=${encodeURIComponent(datum)}`, 

  ) 

}