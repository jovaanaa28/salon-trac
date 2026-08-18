# A.2 – Pravila izveštaja

## Izveštaj 1 – Rezervisani termini po kategorijama usluga

Izveštaj prikazuje ukupan broj trenutno rezervisanih termina,
grupisanih po kategoriji usluge.

Broji se svaka aktivna stavka rezervacije.

Primer:
- rezervacija ima dve usluge iz kategorije Masaže
- obe stavke se računaju
- rezultat za kategoriju Masaže povećava se za 2

Pravila:
- kreiranje rezervacije dodaje njene stavke u izveštaj
- dodavanje usluge povećava broj odgovarajuće kategorije
- uklanjanje usluge smanjuje broj odgovarajuće kategorije
- otkazana rezervacija se ne računa
- izveštaj predstavlja trenutno stanje

## Izveštaj 2 – Broj rezervacija po datumu

Izveštaj prikazuje broj kreiranih rezervacija grupisanih
po originalnom datumu kreiranja rezervacije.

Svaka rezervacija se računa tačno jednom,
bez obzira na broj usluga koje sadrži.

Pravila:
- nova rezervacija povećava broj za datum svog kreiranja
- dodavanje usluge ne utiče na ovaj izveštaj
- uklanjanje usluge ne utiče na ovaj izveštaj
- otkazivanje rezervacije ne uklanja rezervaciju iz ovog izveštaja
- koristi se originalni datum kreiranja
- rezultati se prikazuju hronološki

## Uticaj događaja

| Događaj | Izveštaj 1 | Izveštaj 2 |
|---|---|---|
| rezervacija.kreirana | Dodaju se aktivne stavke | Rezervacija se broji jednom |
| rezervacija.izmenjena | Prikazuje se novo trenutno stanje stavki | Bez promene |
| rezervacija.otkazana | Stavke se više ne računaju | Bez promene |

## Primer

Postoje:

- R1 – dve usluge kategorije Masaže
- R2 – jedna usluga kategorije Tretmani lica

Izveštaj 1:

- Masaže = 2
- Tretmani lica = 1

Izveštaj 2, ako su obe rezervacije kreirane istog dana:

- taj datum = 2 rezervacije

Ako se R1 otkaže:

Izveštaj 1:

- Masaže = 0
- Tretmani lica = 1

Izveštaj 2 ostaje:

- taj datum = 2 rezervacije