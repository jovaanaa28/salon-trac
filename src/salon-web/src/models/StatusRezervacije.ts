export interface StatusRezervacije {
 idZahteva: string
 status: string
 poruka: string
 rezervacijaId: number | null
 sifra: string | null
 promoKod: string | null
 datumKreiranja: string
 datumIzmene: string
}