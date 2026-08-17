import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Zaglavlje from "../components/Zaglavlje";

import type { DozvoljenaValuta } from "../models/DozvoljenaValuta";

import type { Kurs } from "../models/Kurs";

import type { NovaRezervacijaZahtev } from "../models/NovaRezervacija";

import type { ObracunCeneOdgovor } from "../models/ObracunCene";

import type { Termin } from "../models/Termin";

import type { Usluga } from "../models/Usluga";

import { getKurs } from "../services/kursService";

import { getObracunCene } from "../services/obracunService";

import { kreirajRezervaciju } from "../services/rezervacijeService";

import { getDostupneTermine } from "../services/terminiService";

import { getUsluge } from "../services/uslugeService";

import { getValute } from "../services/valuteService";

import "./NovaRezervacija.css";

import { useNavigate } from "react-router";

interface PodaciKorisnika {
  ime: string;

  prezime: string;

  adresa: string;

  postanskiBroj: string;

  mesto: string;

  drzava: string;

  email: string;
}

interface StavkaForme {
  kljuc: number;

  uslugaId: string;

  datum: string;

  vremePocetka: string;

  termini: Termin[];

  ucitavanjeTermina: boolean;
}

const prazniPodaciKorisnika: PodaciKorisnika = {
  ime: "",

  prezime: "",

  adresa: "",

  postanskiBroj: "",

  mesto: "",

  drzava: "",

  email: "",
};

function napraviPraznuStavku(kljuc: number): StavkaForme {
  return {
    kljuc,

    uslugaId: "",

    datum: "",

    vremePocetka: "",

    termini: [],

    ucitavanjeTermina: false,
  };
}

function danasZaInput() {
  const sada = new Date();

  const lokalno = new Date(sada.getTime() - sada.getTimezoneOffset() * 60_000);

  return lokalno

    .toISOString()

    .slice(0, 10);
}

const DANAS = danasZaInput();

function formatirajVreme(vreme: string) {
  return vreme.slice(0, 5);
}

function formatirajCenu(cena: number) {
  return new Intl.NumberFormat(
    "sr-RS",

    {
      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    },
  ).format(cena);
}

function NovaRezervacija() {
  const navigate = useNavigate();

  const sledeciKljuc = useRef(2);

  const [usluge, setUsluge] = useState<Usluga[]>([]);

  const [valute, setValute] = useState<DozvoljenaValuta[]>([]);

  const [stavke, setStavke] = useState<StavkaForme[]>([napraviPraznuStavku(1)]);

  const [podaciKorisnika, setPodaciKorisnika] = useState<PodaciKorisnika>(
    prazniPodaciKorisnika,
  );

  const [izabranaValuta, setIzabranaValuta] = useState("");

  const [promoKod, setPromoKod] = useState("");

  const [kurs, setKurs] = useState<Kurs | null>(null);

  const [obracun, setObracun] = useState<ObracunCeneOdgovor | null>(null);

  const [ucitavanjePodataka, setUcitavanjePodataka] = useState(true);

  const [ucitavanjeKursa, setUcitavanjeKursa] = useState(false);

  const [ucitavanjeObracuna, setUcitavanjeObracuna] = useState(false);

  const [slanje, setSlanje] = useState(false);

  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    let aktivnaKomponenta = true;

    async function ucitajPocetnePodatke() {
      try {
        setUcitavanjePodataka(true);

        setGreska(null);

        const [ucitaneUsluge, ucitaneValute] = await Promise.all([
          getUsluge(),

          getValute(),
        ]);

        if (!aktivnaKomponenta) {
          return;
        }

        setUsluge(ucitaneUsluge);

        setValute(ucitaneValute);

        const podrazumevanaValuta =
          ucitaneValute.find((valuta) => valuta.oznaka === "RSD")?.oznaka ??
          ucitaneValute[0]?.oznaka ??
          "";

        setIzabranaValuta(podrazumevanaValuta);

        if (podrazumevanaValuta) {
          try {
            setUcitavanjeKursa(true);

            const ucitaniKurs = await getKurs(podrazumevanaValuta);

            if (aktivnaKomponenta) {
              setKurs(ucitaniKurs);
            }
          } finally {
            if (aktivnaKomponenta) {
              setUcitavanjeKursa(false);
            }
          }
        }
      } catch (error) {
        if (!aktivnaKomponenta) {
          return;
        }

        if (error instanceof Error) {
          setGreska(error.message);
        } else {
          setGreska("Podatke za rezervaciju nije moguće učitati.");
        }
      } finally {
        if (aktivnaKomponenta) {
          setUcitavanjePodataka(false);
        }
      }
    }

    void ucitajPocetnePodatke();

    return () => {
      aktivnaKomponenta = false;
    };
  }, []);

  const ukupnaCenaRsd = stavke.reduce(
    (ukupno, stavka) => {
      const usluga = usluge.find((u) => u.id === Number(stavka.uslugaId));

      return ukupno + (usluga?.cena ?? 0);
    },

    0,
  );

  function promeniKorisnika(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setPodaciKorisnika((prethodno) => ({
      ...prethodno,

      [name]: value,
    }));

    setGreska(null);
  }

  async function ucitajTermine(
    kljuc: number,

    uslugaId: number,

    datum: string,
  ) {
    if (!uslugaId || !datum) {
      return;
    }

    setStavke((prethodne) =>
      prethodne.map((stavka) =>
        stavka.kljuc === kljuc
          ? {
              ...stavka,

              termini: [],

              vremePocetka: "",

              ucitavanjeTermina: true,
            }
          : stavka,
      ),
    );

    try {
      const dostupniTermini = await getDostupneTermine(
        uslugaId,

        datum,
      );

      setStavke((prethodne) =>
        prethodne.map((stavka) => {
          if (
            stavka.kljuc !== kljuc ||
            Number(stavka.uslugaId) !== uslugaId ||
            stavka.datum !== datum
          ) {
            return stavka;
          }

          return {
            ...stavka,

            termini: dostupniTermini,

            ucitavanjeTermina: false,
          };
        }),
      );
    } catch (error) {
      setStavke((prethodne) =>
        prethodne.map((stavka) =>
          stavka.kljuc === kljuc
            ? {
                ...stavka,

                termini: [],

                vremePocetka: "",

                ucitavanjeTermina: false,
              }
            : stavka,
        ),
      );

      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Slobodne termine nije moguće učitati.");
      }
    }
  }

  function promeniUslugu(
    kljuc: number,

    uslugaId: string,
  ) {
    const trenutnaStavka = stavke.find((stavka) => stavka.kljuc === kljuc);

    const datum = trenutnaStavka?.datum ?? "";

    setStavke((prethodne) =>
      prethodne.map((stavka) =>
        stavka.kljuc === kljuc
          ? {
              ...stavka,

              uslugaId,

              vremePocetka: "",

              termini: [],
            }
          : stavka,
      ),
    );

    setObracun(null);

    setGreska(null);

    if (uslugaId && datum) {
      void ucitajTermine(
        kljuc,

        Number(uslugaId),

        datum,
      );
    }
  }

  function promeniDatum(
    kljuc: number,

    datum: string,
  ) {
    const trenutnaStavka = stavke.find((stavka) => stavka.kljuc === kljuc);

    const uslugaId = trenutnaStavka?.uslugaId ?? "";

    setStavke((prethodne) =>
      prethodne.map((stavka) =>
        stavka.kljuc === kljuc
          ? {
              ...stavka,

              datum,

              vremePocetka: "",

              termini: [],
            }
          : stavka,
      ),
    );

    setGreska(null);

    if (uslugaId && datum) {
      void ucitajTermine(
        kljuc,

        Number(uslugaId),

        datum,
      );
    }
  }

  function promeniVreme(
    kljuc: number,

    vremePocetka: string,
  ) {
    setStavke((prethodne) =>
      prethodne.map((stavka) =>
        stavka.kljuc === kljuc
          ? {
              ...stavka,

              vremePocetka,
            }
          : stavka,
      ),
    );

    setGreska(null);
  }

  function dodajStavku() {
    const noviKljuc = sledeciKljuc.current;

    sledeciKljuc.current += 1;

    setStavke((prethodne) => [...prethodne, napraviPraznuStavku(noviKljuc)]);

    setObracun(null);
  }

  function ukloniStavku(kljuc: number) {
    if (stavke.length === 1) {
      setStavke([napraviPraznuStavku(stavke[0].kljuc)]);
    } else {
      setStavke((prethodne) =>
        prethodne.filter((stavka) => stavka.kljuc !== kljuc),
      );
    }

    setObracun(null);

    setGreska(null);
  }

  async function promeniValutu(novaValuta: string) {
    setIzabranaValuta(novaValuta);

    setKurs(null);

    setGreska(null);

    if (!novaValuta) {
      return;
    }

    try {
      setUcitavanjeKursa(true);

      const noviKurs = await getKurs(novaValuta);

      setKurs(noviKurs);
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Kurs trenutno nije moguće učitati.");
      }
    } finally {
      setUcitavanjeKursa(false);
    }
  }

  async function proveriObracun() {
    setGreska(null);

    if (ukupnaCenaRsd <= 0) {
      setGreska("Izaberi najmanje jednu uslugu.");

      return;
    }

    try {
      setUcitavanjeObracuna(true);

      const rezultat = await getObracunCene({
        ukupnaCenaRsd,

        promoKod: promoKod.trim() || null,
      });

      setObracun(rezultat);
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Obračun cene trenutno nije moguć.");
      }
    } finally {
      setUcitavanjeObracuna(false);
    }
  }

  function validirajFormu() {
    const {
      ime,

      prezime,

      adresa,

      postanskiBroj,

      mesto,

      drzava,

      email,
    } = podaciKorisnika;

    if (
      !ime.trim() ||
      !prezime.trim() ||
      !adresa.trim() ||
      !postanskiBroj.trim() ||
      !mesto.trim() ||
      !drzava.trim() ||
      !email.trim()
    ) {
      return "Svi podaci korisnika su obavezni.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Unesi ispravnu email adresu.";
    }

    if (!izabranaValuta) {
      return "Izaberi valutu.";
    }

    if (!kurs) {
      return "Kurs za izabranu valutu nije učitan.";
    }

    if (stavke.length === 0) {
      return "Rezervacija mora imati najmanje jednu uslugu.";
    }

    for (const stavka of stavke) {
      if (!stavka.uslugaId) {
        return "Izaberi uslugu za svaku stavku rezervacije.";
      }

      if (!stavka.datum) {
        return "Izaberi datum za svaku uslugu.";
      }

      if (stavka.datum < DANAS) {
        return "Datum rezervacije ne može biti u prošlosti.";
      }

      if (!stavka.vremePocetka) {
        return "Izaberi slobodan termin za svaku uslugu.";
      }

      const terminJeDostupan = stavka.termini.some(
        (termin) =>
          termin.vremePocetka === stavka.vremePocetka &&
          termin.dostupnaMesta > 0,
      );

      if (!terminJeDostupan) {
        return "Jedan od izabranih termina više nije dostupan. Izaberi termin ponovo.";
      }
    }

    const jedinstveneStavke = new Set(
      stavke.map(
        (stavka) => `${stavka.uslugaId}|${stavka.datum}|${stavka.vremePocetka}`,
      ),
    );

    if (jedinstveneStavke.size !== stavke.length) {
      return "Ista usluga, datum i termin ne mogu biti dodati dva puta.";
    }

    return null;
  }

  async function posaljiRezervaciju(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setGreska(null);

    const porukaValidacije = validirajFormu();

    if (porukaValidacije) {
      setGreska(porukaValidacije);

      return;
    }

    try {
      setSlanje(true);

      const rezultatObracuna = await getObracunCene({
        ukupnaCenaRsd,

        promoKod: promoKod.trim() || null,
      });

      setObracun(rezultatObracuna);

      if (promoKod.trim() && !rezultatObracuna.promoKodVazi) {
        setGreska("Uneti promo kod nije važeći ili je već iskorišćen.");

        return;
      }

      const zahtev: NovaRezervacijaZahtev = {
        ime: podaciKorisnika.ime.trim(),

        prezime: podaciKorisnika.prezime.trim(),

        adresa: podaciKorisnika.adresa.trim(),

        postanskiBroj: podaciKorisnika.postanskiBroj.trim(),

        mesto: podaciKorisnika.mesto.trim(),

        drzava: podaciKorisnika.drzava.trim(),

        email: podaciKorisnika.email.trim(),

        izabranaValuta,

        promoKod: promoKod.trim()
          ? promoKod

              .trim()

              .toUpperCase()
          : null,

        stavke: stavke.map((stavka) => ({
          uslugaId: Number(stavka.uslugaId),

          datum: `${stavka.datum}T00:00:00`,

          vremePocetka: stavka.vremePocetka,
        })),
      };

      const odgovor = await kreirajRezervaciju(zahtev);
      navigate(`/rezervacija/status/${odgovor.idZahteva}`);
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Zahtev za rezervaciju nije moguće poslati.");
      }
    } finally {
      setSlanje(false);
    }
  }

  const cenaZaPreracun = obracun?.konacnaCenaRsd ?? ukupnaCenaRsd;

  const cenaUIzabranojValuti = kurs ? cenaZaPreracun * kurs.kurs : null;

  return (
    <div className="rezervacija-stranica">
      <Zaglavlje />

      <main className="rezervacija-sadrzaj">
        <div className="rezervacija-naslov">
          <p className="rezervacija-nadnaslov">Salon Trač</p>

          <h1>Rezerviši termin</h1>

          <p>
            Izaberi jednu ili više usluga, odgovarajuće termine i unesi svoje
            podatke.
          </p>
        </div>

        {greska && (
          <div className="rezervacija-poruka rezervacija-greska">{greska}</div>
        )}

        {ucitavanjePodataka ? (
          <div className="rezervacija-status">Učitavanje podataka...</div>
        ) : (
          <form onSubmit={posaljiRezervaciju}>
            <section className="rezervacija-kartica">
              <div className="rezervacija-sekcija-zaglavlje">
                <div>
                  <span className="rezervacija-korak">Korak 1</span>

                  <h2>Usluge i termini</h2>
                </div>

                <button
                  type="button"
                  className="rezervacija-sekundarno-dugme"
                  onClick={dodajStavku}
                >
                  + Dodaj još uslugu
                </button>
              </div>

              <div className="rezervacija-stavke">
                {stavke.map(
                  (
                    stavka,

                    index,
                  ) => (
                    <div className="rezervacija-stavka" key={stavka.kljuc}>
                      <div className="rezervacija-stavka-vrh">
                        <strong>Usluga {index + 1}</strong>

                        <button
                          type="button"
                          className="rezervacija-ukloni-dugme"
                          onClick={() => ukloniStavku(stavka.kljuc)}
                        >
                          Ukloni
                        </button>
                      </div>

                      <div className="rezervacija-grid">
                        <div className="rezervacija-polje">
                          <label>Usluga</label>

                          <select
                            value={stavka.uslugaId}
                            onChange={(event) =>
                              promeniUslugu(
                                stavka.kljuc,

                                event.target.value,
                              )
                            }
                            required
                          >
                            <option value="">Izaberi uslugu</option>

                            {usluge.map((usluga) => (
                              <option key={usluga.id} value={usluga.id}>
                                {usluga.naziv} — {formatirajCenu(usluga.cena)}{" "}
                                RSD
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rezervacija-polje">
                          <label>Datum</label>

                          <input
                            type="date"
                            min={DANAS}
                            value={stavka.datum}
                            onChange={(event) =>
                              promeniDatum(
                                stavka.kljuc,

                                event.target.value,
                              )
                            }
                            required
                          />
                        </div>

                        <div className="rezervacija-polje rezervacija-polje-puno">
                          <label>Slobodan termin</label>

                          <select
                            value={stavka.vremePocetka}
                            onChange={(event) =>
                              promeniVreme(
                                stavka.kljuc,

                                event.target.value,
                              )
                            }
                            disabled={
                              !stavka.uslugaId ||
                              !stavka.datum ||
                              stavka.ucitavanjeTermina
                            }
                            required
                          >
                            <option value="">
                              {stavka.ucitavanjeTermina
                                ? "Učitavanje termina..."
                                : "Izaberi termin"}
                            </option>

                            {stavka.termini.map((termin) => (
                              <option
                                key={termin.vremePocetka}
                                value={termin.vremePocetka}
                              >
                                {formatirajVreme(termin.vremePocetka)}
                                {" — "}
                                slobodnih mesta: {termin.dostupnaMesta}
                              </option>
                            ))}
                          </select>

                          {stavka.uslugaId &&
                            stavka.datum &&
                            !stavka.ucitavanjeTermina &&
                            stavka.termini.length === 0 && (
                              <span className="rezervacija-napomena-greska">
                                Nema slobodnih termina za ovaj datum.
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="rezervacija-kartica">
              <div className="rezervacija-sekcija-zaglavlje">
                <div>
                  <span className="rezervacija-korak">Korak 2</span>

                  <h2>Tvoji podaci</h2>
                </div>
              </div>

              <div className="rezervacija-grid">
                <div className="rezervacija-polje">
                  <label htmlFor="ime">Ime</label>

                  <input
                    id="ime"
                    name="ime"
                    type="text"
                    value={podaciKorisnika.ime}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="prezime">Prezime</label>

                  <input
                    id="prezime"
                    name="prezime"
                    type="text"
                    value={podaciKorisnika.prezime}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje rezervacija-polje-puno">
                  <label htmlFor="adresa">Adresa</label>

                  <input
                    id="adresa"
                    name="adresa"
                    type="text"
                    value={podaciKorisnika.adresa}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="postanskiBroj">Poštanski broj</label>

                  <input
                    id="postanskiBroj"
                    name="postanskiBroj"
                    type="text"
                    value={podaciKorisnika.postanskiBroj}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="mesto">Mesto</label>

                  <input
                    id="mesto"
                    name="mesto"
                    type="text"
                    value={podaciKorisnika.mesto}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="drzava">Država</label>

                  <input
                    id="drzava"
                    name="drzava"
                    type="text"
                    value={podaciKorisnika.drzava}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={podaciKorisnika.email}
                    onChange={promeniKorisnika}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rezervacija-kartica">
              <div className="rezervacija-sekcija-zaglavlje">
                <div>
                  <span className="rezervacija-korak">Korak 3</span>

                  <h2>Valuta i popust</h2>
                </div>
              </div>

              <div className="rezervacija-grid">
                <div className="rezervacija-polje">
                  <label htmlFor="valuta">Valuta</label>

                  <select
                    id="valuta"
                    value={izabranaValuta}
                    onChange={(event) => void promeniValutu(event.target.value)}
                    required
                  >
                    <option value="">Izaberi valutu</option>

                    {valute.map((valuta) => (
                      <option key={valuta.id} value={valuta.oznaka}>
                        {valuta.oznaka} — {valuta.naziv}
                      </option>
                    ))}
                  </select>

                  {ucitavanjeKursa && (
                    <span className="rezervacija-napomena">
                      Učitavanje kursa...
                    </span>
                  )}

                  {kurs && !ucitavanjeKursa && (
                    <span className="rezervacija-napomena">
                      1 RSD = {kurs.kurs} {kurs.izabranaValuta}
                    </span>
                  )}
                </div>

                <div className="rezervacija-polje">
                  <label htmlFor="promoKod">Promo kod</label>

                  <input
                    id="promoKod"
                    type="text"
                    value={promoKod}
                    onChange={(event) => {
                      setPromoKod(event.target.value.toUpperCase());

                      setObracun(null);

                      setGreska(null);
                    }}
                    placeholder="Opciono"
                  />

                  <span className="rezervacija-napomena">
                    Važeći promo kod ostvaruje dodatni popust od 5%.
                  </span>
                </div>
              </div>
            </section>

            <section className="rezervacija-kartica rezervacija-pregled">
              <div className="rezervacija-sekcija-zaglavlje">
                <div>
                  <span className="rezervacija-korak">Korak 4</span>

                  <h2>Pregled cene</h2>
                </div>

                <button
                  type="button"
                  className="rezervacija-sekundarno-dugme"
                  onClick={() => void proveriObracun()}
                  disabled={ucitavanjeObracuna}
                >
                  {ucitavanjeObracuna ? "Računanje..." : "Proveri popust"}
                </button>
              </div>

              <div className="rezervacija-cena-red">
                <span>Ukupna cena usluga</span>

                <strong>{formatirajCenu(ukupnaCenaRsd)} RSD</strong>
              </div>

              {obracun && (
                <>
                  <div className="rezervacija-cena-red">
                    <span>Popust</span>

                    <strong>{obracun.procenatPopusta}%</strong>
                  </div>

                  <div className="rezervacija-cena-red">
                    <span>Iznos popusta</span>

                    <strong>
                      -{formatirajCenu(obracun.iznosPopustaRsd)} RSD
                    </strong>
                  </div>

                  {promoKod.trim() && (
                    <div className="rezervacija-cena-red">
                      <span>Promo kod</span>

                      <strong>
                        {obracun.promoKodVazi ? "Važeći" : "Nije važeći"}
                      </strong>
                    </div>
                  )}
                </>
              )}

              <div className="rezervacija-cena-red rezervacija-konacna-cena">
                <span>Cena za plaćanje</span>

                <strong>{formatirajCenu(cenaZaPreracun)} RSD</strong>
              </div>

              {kurs && cenaUIzabranojValuti !== null && (
                <div className="rezervacija-cena-red rezervacija-valuta-cena">
                  <span>U izabranoj valuti</span>

                  <strong>
                    {formatirajCenu(cenaUIzabranojValuti)} {kurs.izabranaValuta}
                  </strong>
                </div>
              )}

              <div className="rezervacija-submit">
                <button
                  type="submit"
                  className="rezervacija-glavno-dugme"
                  disabled={slanje}
                >
                  {slanje ? "Slanje zahteva..." : "Pošalji rezervaciju"}
                </button>
                
              </div>
            </section>
          </form>
        )}
      </main>
    </div>
  );
}

export default NovaRezervacija;
