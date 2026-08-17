import type {
  KreiranjeRezervacijeOdgovor,
  NovaRezervacijaZahtev,
} from "../models/NovaRezervacija";

import type { StatusRezervacije } from "../models/StatusRezervacije";

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
