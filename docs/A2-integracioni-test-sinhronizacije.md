# A2 - integracioni test sinhronizacije

## Cilj

Provera sinhronizacije podataka između A1 i A2 aplikacije
preko RabbitMQ događaja.

Tok:

A1 -> RabbitMQ -> A2 -> A2 baza

## Testirani događaji

- `rezervacija.kreirana`
- `rezervacija.izmenjena`
- `rezervacija.otkazana`

## Kreiranje rezervacije

Rezultat:

- događaj je primljen u A2
- rezervacija je upisana u tabelu `Rezervacije`
- stavke su upisane u tabelu `StavkeRezervacija`
- događaj je upisan u `ObradjeniDogadjaji`
- RabbitMQ poruka je ACK-ovana

Status: USPEŠNO

## Izmena rezervacije

Rezultat:

- pronađena je postojeća A2 rezervacija
- stare stavke su zamenjene kompletnim trenutnim snapshot-om
- nije kreirana nova rezervacija
- originalni `DatumKreiranja` nije promenjen
- događaj je evidentiran
- RabbitMQ poruka je ACK-ovana

Status: USPEŠNO

## Otkazivanje rezervacije

Rezultat:

- rezervacija nije fizički obrisana
- status rezervacije je promenjen u `OTKAZANA`
- stavke su ostale sačuvane
- originalni `DatumKreiranja` je ostao sačuvan
- događaj je evidentiran
- RabbitMQ poruka je ACK-ovana

Status: USPEŠNO

## Zaključak

Sinhronizacija A1 -> RabbitMQ -> A2 uspešno obrađuje
kreiranje, izmenu i otkazivanje rezervacije.
A2 koristi sopstvenu bazu i ne pristupa direktno A1 bazi.