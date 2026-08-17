export interface StavkaRezervacijeDetalji {
 id: number
 uslugaId: number
 nazivUsluge: string
 datum: string
 vremePocetka: string
 cenaRsd: number
}
export interface RezervacijaDetalji {
 id: number
 ime: string
 prezime: string
 email: string
 status: string
 izabranaValuta: string
 ukupnaCena: number
 popust: number
 konacnaCena: number
 kurs: number
 datumKreiranja: string
 datumOtkazivanja: string | null
 promoKod: string | null
 stavke: StavkaRezervacijeDetalji[]
}