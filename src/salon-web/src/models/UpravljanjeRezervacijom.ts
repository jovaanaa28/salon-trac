export interface DodajStavkuRezervacijeZahtev {
  email: string
  sifra: string
  uslugaId: number
  datum: string
  vremePocetka: string
}

export interface AutorizacijaRezervacijeZahtev {
  email: string
  sifra: string
}

export interface PorukaOdgovor {
  poruka: string
}