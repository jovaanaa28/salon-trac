# A.2 – Test otkazivanja rezervacije

## TASK 58

Testirana je rezervacija #5.

Pre otkazivanja:

- kategorija: Manikir i pedikir
- Izveštaj 1: 1 rezervisani termin
- Izveštaj 2: 2026-08-19 = 1 rezervacija

Rezervacija je otkazana kroz A.1 aplikaciju.

Posle otkazivanja:

- Izveštaj 1: Manikir i pedikir = 0
- Izveštaj 2: 2026-08-19 = 1 rezervacija

Zaključak:

- otkazivanje uklanja stavke rezervacije iz trenutnog izveštaja po kategorijama
- otkazivanje ne menja istorijski izveštaj rezervacija po originalnom datumu kreiranja

Test uspešno prolazi.
