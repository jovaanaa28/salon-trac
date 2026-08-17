import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import AdminNavigacija from '../components/AdminNavigacija'
import type { DozvoljenaValuta } from '../models/DozvoljenaValuta'
import {
  getDatumPopusta,
  sacuvajDatumPopusta,
} from '../services/podesavanjaService'
import {
  dodajValutu,
  getValute,
  izmeniValutu,
  obrisiValutu,
} from '../services/valuteService'
import './AdminPodesavanja.css'

function sortirajValute(
  valute: DozvoljenaValuta[],
) {
  return [...valute].sort(
    (a, b) =>
      a.oznaka.localeCompare(
        b.oznaka,
      ),
  )
}

function datumZaInput(
  datum: string | null,
) {
  if (!datum) {
    return ''
  }

  return datum.slice(0, 10)
}

function AdminPodesavanja() {
  const [valute, setValute] =
    useState<DozvoljenaValuta[]>([])

  const [datumPopusta, setDatumPopusta] =
    useState('')

  const [novaOznaka, setNovaOznaka] =
    useState('')

  const [noviNaziv, setNoviNaziv] =
    useState('')

  const [izmenaId, setIzmenaId] =
    useState<number | null>(null)

  const [
    oznakaZaIzmenu,
    setOznakaZaIzmenu,
  ] = useState('')

  const [
    nazivZaIzmenu,
    setNazivZaIzmenu,
  ] = useState('')

  const [ucitavanje, setUcitavanje] =
    useState(true)

  const [
    cuvanjeDatuma,
    setCuvanjeDatuma,
  ] = useState(false)

  const [
    cuvanjeValute,
    setCuvanjeValute,
  ] = useState(false)

  const [brisanjeId, setBrisanjeId] =
    useState<number | null>(null)

  const [greska, setGreska] =
    useState<string | null>(null)

  const [uspeh, setUspeh] =
    useState<string | null>(null)

  useEffect(() => {
    let aktivnaKomponenta = true

    async function ucitajPodatke() {
      try {
        setUcitavanje(true)
        setGreska(null)

        const [
          ucitaneValute,
          ucitaniDatum,
        ] = await Promise.all([
          getValute(),
          getDatumPopusta(),
        ])

        if (!aktivnaKomponenta) {
          return
        }

        setValute(
          sortirajValute(
            ucitaneValute,
          ),
        )

        setDatumPopusta(
          datumZaInput(
            ucitaniDatum
              .datumDoKadaVaziPopust,
          ),
        )
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska(
            'Podešavanja nije moguće učitati.',
          )
        }
      } finally {
        if (aktivnaKomponenta) {
          setUcitavanje(false)
        }
      }
    }

    void ucitajPodatke()

    return () => {
      aktivnaKomponenta = false
    }
  }, [])

  async function sacuvajDatum(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setGreska(null)
    setUspeh(null)

    const datumZaApi =
      datumPopusta
        ? `${datumPopusta}T00:00:00`
        : null

    try {
      setCuvanjeDatuma(true)

      const sacuvaniDatum =
        await sacuvajDatumPopusta(
          datumZaApi,
        )

      setDatumPopusta(
        datumZaInput(
          sacuvaniDatum
            .datumDoKadaVaziPopust,
        ),
      )

      setUspeh(
        'Datum popusta je uspešno sačuvan.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom čuvanja datuma.',
        )
      }
    } finally {
      setCuvanjeDatuma(false)
    }
  }

  function validirajValutu(
    oznaka: string,
    naziv: string,
  ) {
    if (
      !/^[A-Za-z]{3}$/.test(
        oznaka.trim(),
      )
    ) {
      return 'Oznaka valute mora imati tačno 3 slova.'
    }

    if (!naziv.trim()) {
      return 'Naziv valute je obavezan.'
    }

    return null
  }

  async function dodaj(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setGreska(null)
    setUspeh(null)

    const oznaka =
      novaOznaka
        .trim()
        .toUpperCase()

    const naziv =
      noviNaziv.trim()

    const porukaValidacije =
      validirajValutu(
        oznaka,
        naziv,
      )

    if (porukaValidacije) {
      setGreska(
        porukaValidacije,
      )
      return
    }

    try {
      setCuvanjeValute(true)

      const novaValuta =
        await dodajValutu({
          oznaka,
          naziv,
        })

      setValute((prethodne) =>
        sortirajValute([
          ...prethodne,
          novaValuta,
        ]),
      )

      setNovaOznaka('')
      setNoviNaziv('')

      setUspeh(
        'Valuta je uspešno dodata.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom dodavanja valute.',
        )
      }
    } finally {
      setCuvanjeValute(false)
    }
  }

  function pokreniIzmenu(
    valuta: DozvoljenaValuta,
  ) {
    setIzmenaId(valuta.id)
    setOznakaZaIzmenu(
      valuta.oznaka,
    )
    setNazivZaIzmenu(
      valuta.naziv,
    )
    setGreska(null)
    setUspeh(null)
  }

  function odustaniOdIzmene() {
    setIzmenaId(null)
    setOznakaZaIzmenu('')
    setNazivZaIzmenu('')
  }

  async function sacuvajIzmenu(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (izmenaId === null) {
      return
    }

    setGreska(null)
    setUspeh(null)

    const oznaka =
      oznakaZaIzmenu
        .trim()
        .toUpperCase()

    const naziv =
      nazivZaIzmenu.trim()

    const porukaValidacije =
      validirajValutu(
        oznaka,
        naziv,
      )

    if (porukaValidacije) {
      setGreska(
        porukaValidacije,
      )
      return
    }

    try {
      setCuvanjeValute(true)

      const izmenjenaValuta =
        await izmeniValutu(
          izmenaId,
          {
            oznaka,
            naziv,
          },
        )

      setValute((prethodne) =>
        sortirajValute(
          prethodne.map(
            (valuta) =>
              valuta.id ===
              izmenjenaValuta.id
                ? izmenjenaValuta
                : valuta,
          ),
        ),
      )

      odustaniOdIzmene()

      setUspeh(
        'Valuta je uspešno izmenjena.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom izmene valute.',
        )
      }
    } finally {
      setCuvanjeValute(false)
    }
  }

  async function obrisi(
    valuta: DozvoljenaValuta,
  ) {
    const potvrda =
      window.confirm(
        `Da li sigurno želiš da obrišeš valutu "${valuta.oznaka} - ${valuta.naziv}"?`,
      )

    if (!potvrda) {
      return
    }

    setGreska(null)
    setUspeh(null)

    try {
      setBrisanjeId(
        valuta.id,
      )

      await obrisiValutu(
        valuta.id,
      )

      setValute((prethodne) =>
        prethodne.filter(
          (stavka) =>
            stavka.id !== valuta.id,
        ),
      )

      if (
        izmenaId === valuta.id
      ) {
        odustaniOdIzmene()
      }

      setUspeh(
        'Valuta je uspešno obrisana.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom brisanja valute.',
        )
      }
    } finally {
      setBrisanjeId(null)
    }
  }

  if (ucitavanje) {
    return (
      <div className="admin-podesavanja-stranica">
        <AdminNavigacija />

        <main className="admin-podesavanja-sadrzaj">
          <div className="podesavanja-status">
            Učitavanje podešavanja...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-podesavanja-stranica">
      <AdminNavigacija />

      <main className="admin-podesavanja-sadrzaj">
        <div className="admin-podesavanja-naslov">
          <p className="admin-podesavanja-nadnaslov">
            Administracija
          </p>

          <h1>
            Valute i popust
          </h1>

          <p>
            Odredi dozvoljene valute
            i datum do kada rezervacije
            ostvaruju popust od 10%.
          </p>
        </div>

        {greska && (
          <div className="podesavanja-poruka podesavanja-greska">
            {greska}
          </div>
        )}

        {uspeh && (
          <div className="podesavanja-poruka podesavanja-uspeh">
            {uspeh}
          </div>
        )}

        <section className="datum-popusta-kartica">
          <div className="podesavanja-sekcija-naslov">
            <div>
              <h2>
                Datum popusta
              </h2>

              <p>
                Rezervacije do ovog
                datuma ostvaruju popust
                od 10%.
              </p>
            </div>
          </div>

          <form
            className="datum-popusta-forma"
            onSubmit={sacuvajDatum}
          >
            <div className="podesavanja-polje">
              <label htmlFor="datumPopusta">
                Datum do kada važi popust
              </label>

              <input
                id="datumPopusta"
                type="date"
                value={datumPopusta}
                onChange={(event) => {
                  setDatumPopusta(
                    event.target.value,
                  )
                  setGreska(null)
                  setUspeh(null)
                }}
              />
            </div>

            <button
              type="submit"
              className="podesavanja-glavno-dugme"
              disabled={cuvanjeDatuma}
            >
              {cuvanjeDatuma
                ? 'Čuvanje...'
                : 'Sačuvaj datum'}
            </button>
          </form>

          <p className="datum-napomena">
            Ako datum nije postavljen,
            popust nema definisan krajnji datum.
          </p>
        </section>

        <section className="valute-kartica">
          <div className="podesavanja-sekcija-naslov">
            <div>
              <h2>
                Dozvoljene valute
              </h2>

              <p>
                Valute koje korisnik
                može izabrati prilikom
                rezervacije.
              </p>
            </div>

            <span>
              Ukupno: {valute.length}
            </span>
          </div>

          <form
            className="nova-valuta-forma"
            onSubmit={dodaj}
          >
            <div className="podesavanja-polje oznaka-polje">
              <label htmlFor="novaOznaka">
                Oznaka
              </label>

              <input
                id="novaOznaka"
                type="text"
                minLength={3}
                maxLength={3}
                value={novaOznaka}
                onChange={(event) => {
                  setNovaOznaka(
                    event.target.value
                      .toUpperCase(),
                  )
                  setGreska(null)
                  setUspeh(null)
                }}
                placeholder="EUR"
                required
              />
            </div>

            <div className="podesavanja-polje">
              <label htmlFor="noviNaziv">
                Naziv valute
              </label>

              <input
                id="noviNaziv"
                type="text"
                value={noviNaziv}
                onChange={(event) => {
                  setNoviNaziv(
                    event.target.value,
                  )
                  setGreska(null)
                  setUspeh(null)
                }}
                placeholder="Evro"
                required
              />
            </div>

            <button
              type="submit"
              className="podesavanja-glavno-dugme"
              disabled={cuvanjeValute}
            >
              {cuvanjeValute
                ? 'Čuvanje...'
                : 'Dodaj valutu'}
            </button>
          </form>

          {valute.length === 0 ? (
            <div className="podesavanja-status">
              Trenutno nema dozvoljenih valuta.
            </div>
          ) : (
            <div className="valute-lista">
              {valute.map(
                (valuta) => (
                  <article
                    className="valuta-red"
                    key={valuta.id}
                  >
                    {izmenaId ===
                    valuta.id ? (
                      <form
                        className="izmena-valute-forma"
                        onSubmit={
                          sacuvajIzmenu
                        }
                      >
                        <div className="podesavanja-polje oznaka-polje">
                          <label>
                            Oznaka
                          </label>

                          <input
                            type="text"
                            minLength={3}
                            maxLength={3}
                            value={
                              oznakaZaIzmenu
                            }
                            onChange={(
                              event,
                            ) =>
                              setOznakaZaIzmenu(
                                event.target.value
                                  .toUpperCase(),
                              )
                            }
                            required
                          />
                        </div>

                        <div className="podesavanja-polje">
                          <label>
                            Naziv
                          </label>

                          <input
                            type="text"
                            value={
                              nazivZaIzmenu
                            }
                            onChange={(
                              event,
                            ) =>
                              setNazivZaIzmenu(
                                event.target.value,
                              )
                            }
                            required
                          />
                        </div>

                        <div className="valuta-akcije">
                          <button
                            type="submit"
                            className="valuta-malo-dugme valuta-sacuvaj"
                            disabled={
                              cuvanjeValute
                            }
                          >
                            Sačuvaj
                          </button>

                          <button
                            type="button"
                            className="valuta-malo-dugme valuta-odustani"
                            onClick={
                              odustaniOdIzmene
                            }
                          >
                            Odustani
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="valuta-podaci">
                          <strong className="valuta-oznaka">
                            {
                              valuta.oznaka
                            }
                          </strong>

                          <div>
                            <span>
                              Naziv
                            </span>

                            <strong>
                              {
                                valuta.naziv
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="valuta-akcije">
                          <button
                            type="button"
                            className="valuta-malo-dugme valuta-izmeni"
                            onClick={() =>
                              pokreniIzmenu(
                                valuta,
                              )
                            }
                          >
                            Izmeni
                          </button>

                          <button
                            type="button"
                            className="valuta-malo-dugme valuta-obrisi"
                            disabled={
                              brisanjeId ===
                              valuta.id
                            }
                            onClick={() =>
                              void obrisi(
                                valuta,
                              )
                            }
                          >
                            {brisanjeId ===
                            valuta.id
                              ? 'Brisanje...'
                              : 'Obriši'}
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminPodesavanja