import type {
  KreiranjeRezervacijeOdgovor,
  NovaRezervacijaZahtev,
} from "../models/NovaRezervacija";
import type { StatusRezervacije } from "../models/StatusRezervacije";
import type { RezervacijaDetalji } from "../models/RezervacijaDetalji";
import type { PristupRezervacijiZahtev } from "../models/PristupRezervaciji";
import type {
  AutorizacijaRezervacijeZahtev,
  DodajStavkuRezervacijeZahtev,
  PorukaRezervacijeOdgovor,
} from "../models/IzmenaRezervacije";
import { apiRequest } from "./api";
export function kreirajRezervaciju(zahtev: NovaRezervacijaZahtev) {
  return apiRequest<KreiranjeRezervacijeOdgovor>("/api/rezervacije", {
    method: "POST",
    body: JSON.stringify(zahtev),
  });
}
export function getStatusRezervacije(idZahteva: string) {
  return apiRequest<StatusRezervacije>(
    `/api/rezervacije/status/${encodeURIComponent(idZahteva)}`,
  );
}
export function pristupiRezervaciji(zahtev: PristupRezervacijiZahtev) {
  return apiRequest<RezervacijaDetalji>("/api/rezervacije/pristup", {
    method: "POST",
    body: JSON.stringify(zahtev),
  });
}
export function dodajStavkuRezervacije(
  rezervacijaId: number,
  zahtev: DodajStavkuRezervacijeZahtev,
) {
  return apiRequest<PorukaRezervacijeOdgovor>(
    `/api/rezervacije/${rezervacijaId}/stavke`,
    {
      method: "POST",
      body: JSON.stringify(zahtev),
    },
  );
}
export function obrisiStavkuRezervacije(
  rezervacijaId: number,
  stavkaId: number,
  zahtev: AutorizacijaRezervacijeZahtev,
) {
  return apiRequest<PorukaRezervacijeOdgovor>(
    `/api/rezervacije/${rezervacijaId}/stavke/${stavkaId}`,
    {
      method: "DELETE",
      body: JSON.stringify(zahtev),
    },
  );
}
export function otkaziRezervaciju(
  rezervacijaId: number,
  zahtev: AutorizacijaRezervacijeZahtev,
) {
  return apiRequest<PorukaRezervacijeOdgovor>(
    `/api/rezervacije/${rezervacijaId}/otkazi`,
    {
      method: "POST",
      body: JSON.stringify(zahtev),
    },
  );
}
