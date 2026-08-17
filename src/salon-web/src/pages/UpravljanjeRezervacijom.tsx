import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Zaglavlje from "../components/Zaglavlje";
import type {
  RezervacijaDetalji,
  StavkaRezervacijeDetalji,
} from "../models/RezervacijaDetalji";
import type { Termin } from "../models/Termin";
import type { Usluga } from "../models/Usluga";
import {
  dodajStavkuRezervacije,
  obrisiStavkuRezervacije,
  otkaziRezervaciju,
  pristupiRezervaciji,
} from "../services/rezervacijeService";
import { getDostupneTermine } from "../services/terminiService";
import { getUsluge } from "../services/uslugeService";
import "./UpravljanjeRezervacijom.css";
function danasZaInput() {
  const sada = new Date();
  const lokalno = new Date(sada.getTime() - sada.getTimezoneOffset() * 60_000);
  return lokalno.toISOString().slice(0, 10);
}
const DANAS = danasZaInput();
function formatirajCenu(cena: number) {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cena);
}
function formatirajDatum(datum: string) {
  return new Intl.DateTimeFormat("sr-RS").format(new Date(datum));
}
function formatirajVreme(vreme: string) {
  return vreme.slice(0, 5);
}
function UpravljanjeRezervacijom() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("rezervacijaEmail") ?? "";
  const sifra = sessionStorage.getItem("rezervacijaSifra") ?? "";
  const [rezervacija, setRezervacija] = useState<RezervacijaDetalji | null>(
    null,
  );
  const [usluge, setUsluge] = useState<Usluga[]>([]);
  const [uslugaId, setUslugaId] = useState("");
  const [datum, setDatum] = useState("");
  const [vremePocetka, setVremePocetka] = useState("");
  const [termini, setTermini] = useState<Termin[]>([]);
  const [ucitavanjeTermina, setUcitavanjeTermina] = useState(false);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [dodavanje, setDodavanje] = useState(false);
  const [brisanjeStavkeId, setBrisanjeStavkeId] = useState<number | null>(null);
  const [otkazivanje, setOtkazivanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState<string | null>(null);
  const osveziRezervaciju = useCallback(async () => {
    if (!email || !sifra) {
      throw new Error("Nedostaju podaci za pristup rezervaciji.");
    }
    const rezultat = await pristupiRezervaciji({
      email,
      sifra,
    });
    setRezervacija(rezultat);
    sessionStorage.setItem("rezervacijaId", String(rezultat.id));
    return rezultat;
  }, [email, sifra]);
  useEffect(() => {
    let aktivnaKomponenta = true;
    async function ucitaj() {
      if (!email || !sifra) {
        if (aktivnaKomponenta) {
          setUcitavanje(false);
        }
        return;
      }
      try {
        setUcitavanje(true);
        setGreska(null);
        const [rezultatRezervacije, rezultatUsluga] = await Promise.all([
          pristupiRezervaciji({
            email,
            sifra,
          }),
          getUsluge(),
        ]);
        if (!aktivnaKomponenta) {
          return;
        }
        setRezervacija(rezultatRezervacije);
        setUsluge(rezultatUsluga);
        sessionStorage.setItem("rezervacijaId", String(rezultatRezervacije.id));
      } catch (error) {
        if (!aktivnaKomponenta) {
          return;
        }
        if (error instanceof Error) {
          setGreska(error.message);
        } else {
          setGreska("Rezervaciju nije moguće učitati.");
        }
      } finally {
        if (aktivnaKomponenta) {
          setUcitavanje(false);
        }
      }
    }
    void ucitaj();
    return () => {
      aktivnaKomponenta = false;
    };
  }, [email, sifra]);
  async function ucitajTermine(
    izabranaUslugaId: number,
    izabraniDatum: string,
  ) {
    if (!izabranaUslugaId || !izabraniDatum) {
      setTermini([]);
      return;
    }
    try {
      setUcitavanjeTermina(true);
      setGreska(null);
      const rezultat = await getDostupneTermine(
        izabranaUslugaId,
        izabraniDatum,
      );
      setTermini(rezultat);
    } catch (error) {
      setTermini([]);
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Slobodne termine nije moguće učitati.");
      }
    } finally {
      setUcitavanjeTermina(false);
    }
  }
  function promeniUslugu(novaUslugaId: string) {
    setUslugaId(novaUslugaId);
    setVremePocetka("");
    setTermini([]);
    setGreska(null);
    setUspeh(null);
    if (novaUslugaId && datum) {
      void ucitajTermine(Number(novaUslugaId), datum);
    }
  }
  function promeniDatum(noviDatum: string) {
    setDatum(noviDatum);
    setVremePocetka("");
    setTermini([]);
    setGreska(null);
    setUspeh(null);
    if (uslugaId && noviDatum) {
      void ucitajTermine(Number(uslugaId), noviDatum);
    }
  }
  async function dodajUslugu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rezervacija) {
      return;
    }
    setGreska(null);
    setUspeh(null);
    if (!uslugaId || !datum || !vremePocetka) {
      setGreska("Izaberi uslugu, datum i termin.");
      return;
    }
    if (datum < DANAS) {
      setGreska("Datum ne može biti u prošlosti.");
      return;
    }
    try {
      setDodavanje(true);
      await dodajStavkuRezervacije(rezervacija.id, {
        email,
        sifra,
        uslugaId: Number(uslugaId),
        datum: `${datum}T00:00:00`,
        vremePocetka,
      });
      await osveziRezervaciju();
      setUslugaId("");
      setDatum("");
      setVremePocetka("");
      setTermini([]);
      setUspeh("Usluga je uspešno dodata na rezervaciju.");
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Uslugu nije moguće dodati.");
      }
    } finally {
      setDodavanje(false);
    }
  }
  async function ukloniUslugu(stavka: StavkaRezervacijeDetalji) {
    if (!rezervacija) {
      return;
    }
    const potvrda = window.confirm(
      `Da li sigurno želiš da ukloniš uslugu "${stavka.nazivUsluge}" iz rezervacije?`,
    );
    if (!potvrda) {
      return;
    }
    setGreska(null);
    setUspeh(null);
    try {
      setBrisanjeStavkeId(stavka.id);
      await obrisiStavkuRezervacije(rezervacija.id, stavka.id, {
        email,
        sifra,
      });
      await osveziRezervaciju();
      setUspeh("Usluga je uspešno uklonjena iz rezervacije.");
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Uslugu nije moguće ukloniti.");
      }
    } finally {
      setBrisanjeStavkeId(null);
    }
  }
  async function otkazi() {
    if (!rezervacija) {
      return;
    }
    const potvrda = window.confirm(
      "Da li sigurno želiš da otkažeš celu rezervaciju? Ova radnja se ne može poništiti.",
    );
    if (!potvrda) {
      return;
    }
    setGreska(null);
    setUspeh(null);
    try {
      setOtkazivanje(true);
      await otkaziRezervaciju(rezervacija.id, {
        email,
        sifra,
      });
      await osveziRezervaciju();
      setUspeh("Rezervacija je uspešno otkazana.");
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
      } else {
        setGreska("Rezervaciju nije moguće otkazati.");
      }
    } finally {
      setOtkazivanje(false);
    }
  }
  function zavrsiUpravljanje() {
    sessionStorage.removeItem("rezervacijaEmail");
    sessionStorage.removeItem("rezervacijaSifra");
    sessionStorage.removeItem("rezervacijaId");
    navigate("/moja-rezervacija");
  }
  if (!email || !sifra) {
    return (
      <div className="upravljanje-stranica">
        <Zaglavlje />
        <main className="upravljanje-sadrzaj">
          <section className="upravljanje-kartica upravljanje-centar">
            <h1>Potreban je pristup rezervaciji</h1>
            <p>Prvo unesi email i pristupnu šifru.</p>
            <Link
              to="/moja-rezervacija"
              className="upravljanje-glavno-dugme upravljanje-link"
            >
              Pristupi rezervaciji
            </Link>
          </section>
        </main>
      </div>
    );
  }
  if (ucitavanje) {
    return (
      <div className="upravljanje-stranica">
        <Zaglavlje />
        <main className="upravljanje-sadrzaj">
          <div className="upravljanje-status">Učitavanje rezervacije...</div>
        </main>
      </div>
    );
  }
  if (!rezervacija) {
    return (
      <div className="upravljanje-stranica">
        <Zaglavlje />
        <main className="upravljanje-sadrzaj">
          <section className="upravljanje-kartica upravljanje-centar">
            <h1>Rezervaciju nije moguće prikazati</h1>
            <p>{greska ?? "Pokušaj ponovo da pristupiš rezervaciji."}</p>
            <button
              type="button"
              className="upravljanje-glavno-dugme"
              onClick={zavrsiUpravljanje}
            >
              Novi pristup
            </button>
          </section>
        </main>
      </div>
    );
  }
  const aktivna = rezervacija.status === "AKTIVNA";
  return (
    <div className="upravljanje-stranica">
      <Zaglavlje />
      <main className="upravljanje-sadrzaj">
        <div className="upravljanje-naslov">
          <p className="upravljanje-nadnaslov">Moja rezervacija</p>
          <h1>Upravljanje rezervacijom #{rezervacija.id}</h1>
          <p>
            Pregledaj rezervaciju, dodaj ili ukloni uslugu i po potrebi otkaži
            rezervaciju.
          </p>
        </div>
        {greska && (
          <div className="upravljanje-poruka upravljanje-greska">{greska}</div>
        )}
        {uspeh && (
          <div className="upravljanje-poruka upravljanje-uspeh">{uspeh}</div>
        )}
        <section className="upravljanje-kartica">
          <div className="upravljanje-zaglavlje-rezervacije">
            <div>
              <span>Rezervacija</span>
              <h2>
                {rezervacija.ime} {rezervacija.prezime}
              </h2>
              <p>{rezervacija.email}</p>
            </div>
            <span
              className={
                aktivna
                  ? "upravljanje-status-badge status-aktivna"
                  : "upravljanje-status-badge status-otkazana"
              }
            >
              {rezervacija.status}
            </span>
          </div>
          <div className="upravljanje-info-grid">
            <div>
              <span>Datum kreiranja</span>
              <strong>{formatirajDatum(rezervacija.datumKreiranja)}</strong>
            </div>
            <div>
              <span>Valuta</span>
              <strong>{rezervacija.izabranaValuta}</strong>
            </div>
            <div>
              <span>Popust</span>
              <strong>{rezervacija.popust}%</strong>
            </div>
            <div>
              <span>Konačna cena</span>
              <strong>
                {formatirajCenu(rezervacija.konacnaCena)}{" "}
                {rezervacija.izabranaValuta}
              </strong>
            </div>
          </div>
          {!aktivna && rezervacija.datumOtkazivanja && (
            <div className="upravljanje-otkazana-info">
              Otkazana: {formatirajDatum(rezervacija.datumOtkazivanja)}
            </div>
          )}
        </section>
        <section className="upravljanje-kartica">
          <div className="upravljanje-sekcija-naslov">
            <div>
              <span className="upravljanje-korak">Pregled</span>
              <h2>Rezervisane usluge</h2>
            </div>
            <span>Ukupno: {rezervacija.stavke.length}</span>
          </div>
          <div className="upravljanje-usluge">
            {rezervacija.stavke.map((stavka) => (
              <article className="upravljanje-usluga" key={stavka.id}>
                <div>
                  <strong>{stavka.nazivUsluge}</strong>
                  <span>
                    {formatirajDatum(stavka.datum)}
                    {" · "}
                    {formatirajVreme(stavka.vremePocetka)}
                  </span>
                </div>
                <div className="upravljanje-usluga-desno">
                  <strong>{formatirajCenu(stavka.cenaRsd)} RSD</strong>
                  {aktivna && (
                    <button
                      type="button"
                      className="upravljanje-obrisi-uslugu"
                      disabled={
                        rezervacija.stavke.length <= 1 ||
                        brisanjeStavkeId === stavka.id
                      }
                      onClick={() => void ukloniUslugu(stavka)}
                    >
                      {brisanjeStavkeId === stavka.id
                        ? "Uklanjanje..."
                        : "Ukloni"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {aktivna && rezervacija.stavke.length === 1 && (
            <p className="upravljanje-napomena">
              Poslednja usluga se ne uklanja pojedinačno. Ako više ne želiš
              rezervaciju, otkaži celu rezervaciju.
            </p>
          )}
        </section>
        {aktivna ? (
          <>
            <section className="upravljanje-kartica">
              <div className="upravljanje-sekcija-naslov">
                <div>
                  <span className="upravljanje-korak">Izmena</span>
                  <h2>Dodaj uslugu</h2>
                </div>
              </div>
              <form className="upravljanje-dodaj-forma" onSubmit={dodajUslugu}>
                <div className="upravljanje-polje">
                  <label htmlFor="novaUsluga">Usluga</label>
                  <select
                    id="novaUsluga"
                    value={uslugaId}
                    onChange={(event) => promeniUslugu(event.target.value)}
                    required
                  >
                    <option value="">Izaberi uslugu</option>
                    {usluge.map((usluga) => (
                      <option key={usluga.id} value={usluga.id}>
                        {usluga.naziv} — {formatirajCenu(usluga.cena)} RSD
                      </option>
                    ))}
                  </select>
                </div>
                <div className="upravljanje-polje">
                  <label htmlFor="noviDatum">Datum</label>
                  <input
                    id="noviDatum"
                    type="date"
                    min={DANAS}
                    value={datum}
                    onChange={(event) => promeniDatum(event.target.value)}
                    required
                  />
                </div>
                <div className="upravljanje-polje">
                  <label htmlFor="noviTermin">Slobodan termin</label>
                  <select
                    id="noviTermin"
                    value={vremePocetka}
                    onChange={(event) => {
                      setVremePocetka(event.target.value);
                      setGreska(null);
                      setUspeh(null);
                    }}
                    disabled={!uslugaId || !datum || ucitavanjeTermina}
                    required
                  >
                    <option value="">
                      {ucitavanjeTermina
                        ? "Učitavanje termina..."
                        : "Izaberi termin"}
                    </option>
                    {termini.map((termin) => (
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
                  {uslugaId &&
                    datum &&
                    !ucitavanjeTermina &&
                    termini.length === 0 && (
                      <span className="upravljanje-polje-greska">
                        Nema slobodnih termina za izabrani datum.
                      </span>
                    )}
                </div>
                <button
                  type="submit"
                  className="upravljanje-glavno-dugme"
                  disabled={dodavanje}
                >
                  {dodavanje ? "Dodavanje..." : "Dodaj uslugu"}
                </button>
              </form>
            </section>
            <section className="upravljanje-kartica upravljanje-opasna-zona">
              <div>
                <span className="upravljanje-korak">Otkazivanje</span>
                <h2>Otkaži rezervaciju</h2>
                <p>
                  Otkazana rezervacija ostaje u istoriji i više ne može da se
                  aktivira niti menja.
                </p>
              </div>
              <button
                type="button"
                className="upravljanje-otkazi-dugme"
                disabled={otkazivanje}
                onClick={() => void otkazi()}
              >
                {otkazivanje ? "Otkazivanje..." : "Otkaži rezervaciju"}
              </button>
            </section>
          </>
        ) : (
          <section className="upravljanje-kartica upravljanje-otkazana-kartica">
            <h2>Rezervacija je otkazana</h2>
            <p>
              Ova rezervacija ostaje dostupna kao istorijski podatak, ali više
              nije moguće dodavati ili uklanjati usluge niti je ponovo
              aktivirati.
            </p>
            {rezervacija.promoKod && (
              <p>
                Promo kod generisan ovom rezervacijom:{" "}
                <strong>{rezervacija.promoKod}</strong>. Ako pre otkazivanja
                nije bio iskorišćen, više nije važeći.
              </p>
            )}
          </section>
        )}
        <div className="upravljanje-donje-akcije">
          <Link
            to="/"
            className="upravljanje-sekundarno-dugme upravljanje-link"
          >
            Nazad na početnu
          </Link>
          <button
            type="button"
            className="upravljanje-sekundarno-dugme"
            onClick={zavrsiUpravljanje}
          >
            Druga rezervacija
          </button>
        </div>
      </main>
    </div>
  );
}
export default UpravljanjeRezervacijom;
