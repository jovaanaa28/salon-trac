import type { 

  KreiranjeRezervacijeOdgovor, 

  NovaRezervacijaZahtev, 

} from '../models/NovaRezervacija' 

import { apiRequest } from './api' 

 

export function kreirajRezervaciju( 

  zahtev: NovaRezervacijaZahtev, 

) { 

  return apiRequest<KreiranjeRezervacijeOdgovor>( 

    '/api/rezervacije', 

    { 

      method: 'POST', 

      body: JSON.stringify(zahtev), 

    }, 

  ) 

}