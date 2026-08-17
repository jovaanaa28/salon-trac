import type {
  KreiranjeRezervacijeOdgovor,
  NovaRezervacijaZahtev,
} from "../models/NovaRezervacija";

import type { StatusRezervacije } from "../models/StatusRezervacije";

import type { RezervacijaDetalji } from "../models/RezervacijaDetalji";

import type { PristupRezervacijiZahtev } from "../models/PristupRezervaciji";

import { apiRequest } from "./api";

export function kreirajRezervaciju(zahtev: NovaRezervacijaZahtev) {
  return apiRequest<KreiranjeRezervacijeOdgovor>(
    "/api/rezervacije",

    {
      method: "POST",

      body: JSON.stringify(zahtev),
    },
  );
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
