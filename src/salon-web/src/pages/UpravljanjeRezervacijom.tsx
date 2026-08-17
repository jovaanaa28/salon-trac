import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router'

import Zaglavlje from '../components/Zaglavlje'

import type {
  RezervacijaDetalji,
} from '../models/RezervacijaDetalji'

import type {
  Termin,
} from '../models/Termin'

import type {
  Usluga,
} from '../models/Usluga'

import {
  dodajStavkuRezervaciji,
  otkaziRezervaciju,
  pristupiRezervaciji,
  ukloniStavkuIzRezervacije,
} from '../services/rezervacijeService'

import {
  getDostupneTermine,
} from '../services/terminiService'

import {
  getUsluge,
} from '../services/uslugeService'

import './PristupRezervaciji.css'
import './UpravljanjeRezervacijom.css'

function danasZaInput() {
  const sada = new Date()

  const lokalno = new Date(
    sada.getTime() -
      sada.getTimezoneOffset() * 60_000,
  )

  return lokalno
    .toISOString()
    .slice(0, 10)
}

const DANAS = danasZaInput()

function formatirajCenu(
  cena: number,
) {
  return new Intl.NumberFormat(
    'sr-RS',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(cena)
}

function formatirajDatum(
  datum: string,
) {
  return new Intl.DateTimeFormat(
    'sr-RS',
  ).format(new Date(datum))
}

function formatirajVreme(
  vreme: string,
) {
  return vreme.slice(0, 5)
}

function UpravljanjeRezervacijom() {
  const navigate = useNavigate()

  const email =
    sessionStorage.getItem(
      'rezervacijaEmail',
    ) ?? ''

  const sifra =
    sessionStorage.getItem(
      'rezervacijaSifra',
    ) ?? ''

  const rezervacijaId = Number(
    sessionStorage.getItem(
      'rezervacijaId',
    ) ?? 0,
  )

  const [
    rezervacija,
    setRezervacija,
  ] =
    useState<RezervacijaDetalji | null>(
      null,
    )

  const [
    usluge,
    setUsluge,
  ] =
    useState<Usluga[]>([])

  const [
    uslugaId,
    setUslugaId,
  ] =
    useState('')

  const [
    datum,
    setDatum,
  ] =
    useState('')

  const [
    vremePocetka,
    setVremePocetka,
  ] =
    useState('')

  const [
    termini,
    setTermini,
  ] =
    useState<Termin[]>([])

  const [
    ucitavanje,
    setUcitavanje,
  ] =
    useState(true)

  const [
    ucitavanjeTermina,
    setUcitavanjeTermina,
  ] =
    useState(false)

  const [
    akcija,
    setAkcija,
  ] =
    useState<string | null>(null)

  const [
    greska,
    setGreska,
  ] =
    useState<string | null>(null)

  const [
    poruka,
    setPoruka,
  ] =
    useState<string | null>(null)

  async function osveziRezervaciju() {
    const rezultat =
      await pristupiRezervaciji({
        email,
        sifra,
      })

    setRezervacija(rezultat)

    return rezultat
  }

  useEffect(() => {
    if (
      !email ||
      !sifra ||
      !rezervacijaId
    ) {
      navigate(
        '/moja-rezervacija',
        {
          replace: true,
        },
      )

      return
    }

    let aktivnaKomponenta = true

    async function ucitaj() {
      try {
        setUcitavanje(true)

        const [
          ucitanaRezervacija,
          ucitaneUsluge,
        ] =
          await Promise.all([
            pristupiRezervaciji({
              email,
              sifra,
            }),
            getUsluge(),
          ])

        if (!aktivnaKomponenta) {
          return
        }

        setRezervacija(
          ucitanaRezervacija,
        )

        setUsluge(
          ucitaneUsluge,
        )
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (
          error instanceof Error
        ) {
          setGreska(
            error.message,
          )
        } else {
          setGreska(
            'Rezervaciju nije moguće učitati.',
          )
        }
      } finally {
        if (aktivnaKomponenta) {
          setUcitavanje(false)
        }
      }
    }

    void ucitaj()

    return () => {
      aktivnaKomponenta = false
    }
  }, [
    email,
    sifra,
    rezervacijaId,
    navigate,
  ])

  async function ucitajTermine(
    noviUslugaId: number,
    noviDatum: string,
  ) {
    if (
      !noviUslugaId ||
      !noviDatum
    ) {
      setTermini([])
      return
    }

    try {
      setUcitavanjeTermina(true)
      setGreska(null)

      const rezultat =
        await getDostupneTermine(
          noviUslugaId,
          noviDatum,
        )

      setTermini(rezultat)
    } catch (error) {
      setTermini([])

      if (
        error instanceof Error
      ) {
        setGreska(
          error.message,
        )
      } else {
        setGreska(
          'Slobodne termine nije moguće učitati.',
        )
      }
    } finally {
      setUcitavanjeTermina(false)
    }
  }

  function promeniUslugu(
    novaVrednost: string,
  ) {
    setUslugaId(
      novaVrednost,
    )

    setVremePocetka('')
    setTermini([])
    setGreska(null)
    setPoruka(null)

    if (
      novaVrednost &&
      datum
    ) {
      void ucitajTermine(
        Number(novaVrednost),
        datum,
      )
    }
  }

  function promeniDatum(
    noviDatum: string,
  ) {
    setDatum(noviDatum)
    setVremePocetka('')
    setTermini([])
    setGreska(null)
    setPoruka(null)

    if (
      uslugaId &&
      noviDatum
    ) {
      void ucitajTermine(
        Number(uslugaId),
        noviDatum,
      )
    }
  }

  async function dodajUslugu() {
    if (!rezervacija) {
      return
    }

    if (
      rezervacija.status
        .toUpperCase() !==
      'AKTIVNA'
    ) {
      setGreska(
        'Otkazana rezervacija ne može da se menja.',
      )
      return
    }

    if (
      !uslugaId ||
      !datum ||
      !vremePocetka
    ) {
      setGreska(
        'Izaberi uslugu, datum i termin.',
      )
      return
    }

    try {
      setAkcija('dodavanje')
      setGreska(null)
      setPoruka(null)

      const odgovor =
        await dodajStavkuRezervaciji(
          rezervacija.id,
          {
            email,
            sifra,
            uslugaId:
              Number(uslugaId),
            datum,
            vremePocetka,
          },
        )

      await osveziRezervaciju()

      setUslugaId('')
      setDatum('')
      setVremePocetka('')
      setTermini([])

      setPoruka(
        odgovor.poruka ||
          'Usluga je dodata na rezervaciju.',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setGreska(
          error.message,
        )
      } else {
        setGreska(
          'Uslugu nije moguće dodati.',
        )
      }
    } finally {
      setAkcija(null)
    }
  }

  async function ukloniUslugu(
    stavkaId: number,
    nazivUsluge: string,
  ) {
    if (!rezervacija) {
      return
    }

    if (
      rezervacija.stavke.length <= 1
    ) {
      setGreska(
        'Poslednja usluga se ne uklanja. Otkažite celu rezervaciju.',
      )
      return
    }

    const potvrda =
      window.confirm(
        `Da li sigurno želiš da ukloniš uslugu "${nazivUsluge}"?`,
      )

    if (!potvrda) {
      return
    }

    try {
      setAkcija(
        `brisanje-${stavkaId}`,
      )

      setGreska(null)
      setPoruka(null)

      const odgovor =
        await ukloniStavkuIzRezervacije(
          rezervacija.id,
          stavkaId,
          {
            email,
            sifra,
          },
        )

      await osveziRezervaciju()

      setPoruka(
        odgovor.poruka ||
          'Usluga je uklonjena iz rezervacije.',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setGreska(
          error.message,
        )
      } else {
        setGreska(
          'Uslugu nije moguće ukloniti.',
        )
      }
    } finally {
      setAkcija(null)
    }
  }

  async function otkazi() {
    if (!rezervacija) {
      return
    }

    const potvrda =
      window.confirm(
        'Da li sigurno želiš da otkažeš celu rezervaciju? Otkazana rezervacija ne može ponovo da se aktivira.',
      )

    if (!potvrda) {
      return
    }

    try {
      setAkcija(
        'otkazivanje',
      )

      setGreska(null)
      setPoruka(null)

      const odgovor =
        await otkaziRezervaciju(
          rezervacija.id,
          {
            email,
            sifra,
          },
        )

      await osveziRezervaciju()

      setTermini([])
      setUslugaId('')
      setDatum('')
      setVremePocetka('')

      setPoruka(
        odgovor.poruka ||
          'Rezervacija je otkazana.',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setGreska(
          error.message,
        )
      } else {
        setGreska(
          'Rezervaciju nije moguće otkazati.',
        )
      }
    } finally {
      setAkcija(null)
    }
  }

  function nazadNaPristup() {
    sessionStorage.removeItem(
      'rezervacijaEmail',
    )

    sessionStorage.removeItem(
      'rezervacijaSifra',
    )

    sessionStorage.removeItem(
      'rezervacijaId',
    )

    navigate(
      '/moja-rezervacija',
    )
  }

  if (ucitavanje) {
    return (
      <div className="pristup-rezervaciji-stranica">
        <Zaglavlje />

        <main className="pristup-rezervaciji-sadrzaj">
          <section className="pristup-kartica">
            <p className="pristup-opis">
              Učitavanje rezervacije...
            </p>
          </section>
        </main>
      </div>
    )
  }

  if (
    !rezervacija
  ) {
    return (
      <div className="pristup-rezervaciji-stranica">
        <Zaglavlje />

        <main className="pristup-rezervaciji-sadrzaj">
          <section className="pristup-kartica">
            {greska && (
              <div className="pristup-poruka pristup-greska">
                {greska}
              </div>
            )}

            <button
              type="button"
              className="pristup-sekundarno-dugme"
              onClick={nazadNaPristup}
            >
              Nazad na pristup rezervaciji
            </button>
          </section>
        </main>
      </div>
    )
  }

  const aktivna =
    rezervacija.status
      .toUpperCase() ===
    'AKTIVNA'

  return (
    <div className="pristup-rezervaciji-stranica">
      <Zaglavlje />

      <main className="pristup-rezervaciji-sadrzaj">
        <div className="pristup-rezervaciji-naslov">
          <p className="pristup-rezervaciji-nadnaslov">
            Salon Trač
          </p>

          <h1>
            Upravljanje rezervacijom
          </h1>

          <p>
            Pregledaj rezervaciju,
            dodaj ili ukloni uslugu
            ili otkaži celu rezervaciju.
          </p>
        </div>

        <section className="pristup-kartica">
          <h2>
            Rezervacija #{rezervacija.id}
          </h2>

          <div className="pristup-osnovni-podaci">
            <div>
              <span>
                Korisnik
              </span>

              <strong>
                {rezervacija.ime}{' '}
                {rezervacija.prezime}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {rezervacija.email}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {rezervacija.status}
              </strong>
            </div>

            <div>
              <span>
                Datum kreiranja
              </span>

              <strong>
                {formatirajDatum(
                  rezervacija.datumKreiranja,
                )}
              </strong>
            </div>
          </div>

          {rezervacija.datumOtkazivanja && (
            <div className="upravljanje-otkazana-napomena">
              Rezervacija je otkazana{' '}
              {formatirajDatum(
                rezervacija.datumOtkazivanja,
              )}
              . Više je nije moguće menjati.
            </div>
          )}

          <div className="pristup-cena-kartica">
            <div>
              <span>
                Ukupna cena
              </span>

              <strong>
                {formatirajCenu(
                  rezervacija.ukupnaCena,
                )}{' '}
                {rezervacija.izabranaValuta}
              </strong>
            </div>

            <div>
              <span>
                Popust
              </span>

              <strong>
                {rezervacija.popust}%
              </strong>
            </div>

            <div className="pristup-konacna-cena">
              <span>
                Konačna cena
              </span>

              <strong>
                {formatirajCenu(
                  rezervacija.konacnaCena,
                )}{' '}
                {rezervacija.izabranaValuta}
              </strong>
            </div>
          </div>

          {poruka && (
            <div className="pristup-poruka upravljanje-uspeh">
              {poruka}
            </div>
          )}

          {greska && (
            <div className="pristup-poruka pristup-greska">
              {greska}
            </div>
          )}

          <div className="pristup-usluge">
            <h3>
              Rezervisane usluge
            </h3>

            {rezervacija.stavke.map(
              (stavka) => (
                <article
                  className="pristup-usluga"
                  key={stavka.id}
                >
                  <div>
                    <strong>
                      {stavka.nazivUsluge}
                    </strong>

                    <span>
                      {formatirajDatum(
                        stavka.datum,
                      )}
                      {' · '}
                      {formatirajVreme(
                        stavka.vremePocetka,
                      )}
                    </span>
                  </div>

                  <div className="upravljanje-stavka-desno">
                    <strong className="pristup-usluga-cena">
                      {formatirajCenu(
                        stavka.cenaRsd,
                      )}{' '}
                      RSD
                    </strong>

                    {aktivna && (
                      <button
                        type="button"
                        className="upravljanje-ukloni-dugme"
                        disabled={
                          rezervacija.stavke.length <= 1 ||
                          akcija !== null
                        }
                        onClick={() =>
                          void ukloniUslugu(
                            stavka.id,
                            stavka.nazivUsluge,
                          )
                        }
                      >
                        {akcija ===
                        `brisanje-${stavka.id}`
                          ? 'Uklanjanje...'
                          : 'Ukloni'}
                      </button>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>

          {aktivna && (
            <section className="upravljanje-dodavanje">
              <h3>
                Dodaj novu uslugu
              </h3>

              <p>
                Izaberi uslugu, datum i
                jedan od trenutno slobodnih termina.
              </p>

              <div className="pristup-polje">
                <label htmlFor="nova-usluga">
                  Usluga
                </label>

                <select
                  id="nova-usluga"
                  value={uslugaId}
                  onChange={(event) =>
                    promeniUslugu(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Izaberi uslugu
                  </option>

                  {usluge.map(
                    (usluga) => (
                      <option
                        key={usluga.id}
                        value={usluga.id}
                      >
                        {usluga.naziv}
                        {' — '}
                        {formatirajCenu(
                          usluga.cena,
                        )}
                        {' RSD'}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="pristup-polje">
                <label htmlFor="novi-datum">
                  Datum
                </label>

                <input
                  id="novi-datum"
                  type="date"
                  min={DANAS}
                  value={datum}
                  onChange={(event) =>
                    promeniDatum(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="pristup-polje">
                <label htmlFor="novi-termin">
                  Termin
                </label>

                <select
                  id="novi-termin"
                  value={vremePocetka}
                  disabled={
                    !uslugaId ||
                    !datum ||
                    ucitavanjeTermina
                  }
                  onChange={(event) => {
                    setVremePocetka(
                      event.target.value,
                    )
                    setGreska(null)
                    setPoruka(null)
                  }}
                >
                  <option value="">
                    {ucitavanjeTermina
                      ? 'Učitavanje termina...'
                      : 'Izaberi termin'}
                  </option>

                  {termini.map(
                    (termin) => (
                      <option
                        key={
                          termin.vremePocetka
                        }
                        value={
                          termin.vremePocetka
                        }
                      >
                        {formatirajVreme(
                          termin.vremePocetka,
                        )}
                        {' — slobodnih mesta: '}
                        {termin.dostupnaMesta}
                      </option>
                    ),
                  )}
                </select>

                {uslugaId &&
                  datum &&
                  !ucitavanjeTermina &&
                  termini.length === 0 && (
                    <span className="pristup-napomena">
                      Za ovaj datum trenutno nema slobodnih termina.
                    </span>
                  )}
              </div>

              <button
                type="button"
                className="pristup-glavno-dugme"
                disabled={
                  akcija !== null ||
                  !uslugaId ||
                  !datum ||
                  !vremePocetka
                }
                onClick={() =>
                  void dodajUslugu()
                }
              >
                {akcija === 'dodavanje'
                  ? 'Dodavanje...'
                  : 'Dodaj uslugu'}
              </button>
            </section>
          )}

          {aktivna && (
            <section className="upravljanje-otkazivanje">
              <h3>
                Otkazivanje rezervacije
              </h3>

              <p>
                Otkazana rezervacija
                ostaje u istoriji i ne
                može ponovo da se aktivira.
              </p>

              <button
                type="button"
                className="upravljanje-otkazi-dugme"
                disabled={
                  akcija !== null
                }
                onClick={() =>
                  void otkazi()
                }
              >
                {akcija ===
                'otkazivanje'
                  ? 'Otkazivanje...'
                  : 'Otkaži rezervaciju'}
              </button>
            </section>
          )}

          <button
            type="button"
            className="pristup-sekundarno-dugme"
            onClick={nazadNaPristup}
          >
            Pristupi drugoj rezervaciji
          </button>
        </section>
      </main>
    </div>
  )
}

export default UpravljanjeRezervacijom