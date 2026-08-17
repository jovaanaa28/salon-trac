export interface Usluga {
  id: number
  naziv: string
  opis: string
  trajanjeUMinutima: number
  maksimalanBrojKlijenataPoTerminu: number
  vremePocetkaPrvogTermina: string
  vremeZavrsetkaPoslednjegTermina: string
  cena: number
  kategorijaUslugeId: number
  kategorijaNaziv?: string | null
}