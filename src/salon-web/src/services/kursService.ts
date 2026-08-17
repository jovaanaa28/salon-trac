import type { Kurs } from '../models/Kurs' 

import { apiRequest } from './api' 

 

export function getKurs( 

  valuta: string, 

) { 

  return apiRequest<Kurs>( 

    `/api/kurs/${encodeURIComponent(valuta)}`, 

  ) 

}