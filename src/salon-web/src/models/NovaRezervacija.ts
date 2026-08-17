export interface StavkaNoveRezervacije { 

  uslugaId: number 

  datum: string 

  vremePocetka: string 

} 

 

export interface NovaRezervacijaZahtev { 

  ime: string 

  prezime: string 

  adresa: string 

  postanskiBroj: string 

  mesto: string 

  drzava: string 

  email: string 

  izabranaValuta: string 

  promoKod: string | null 

  stavke: StavkaNoveRezervacije[] 

} 

 

export interface KreiranjeRezervacijeOdgovor { 

  idZahteva: string 

  status: string 

  poruka: string 

} 