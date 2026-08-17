import type { 

  ObracunCeneOdgovor, 

  ObracunCeneZahtev, 

} from '../models/ObracunCene' 

import { apiRequest } from './api' 

 

export function getObracunCene( 

  zahtev: ObracunCeneZahtev, 

) { 

  return apiRequest<ObracunCeneOdgovor>( 

    '/api/obracun/preview', 

    { 

      method: 'POST', 

      body: JSON.stringify(zahtev), 

    }, 

  ) 

} 