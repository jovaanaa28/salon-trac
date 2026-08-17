export interface ObracunCeneZahtev { 

  ukupnaCenaRsd: number 

  promoKod: string | null 

} 

 

export interface ObracunCeneOdgovor { 

  ukupnaCenaRsd: number 

  procenatPopusta: number 

  iznosPopustaRsd: number 

  konacnaCenaRsd: number 

  promoKodVazi: boolean 

}