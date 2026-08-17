import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import AdminNavigacija from '../components/AdminNavigacija'
import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import {
  dodajKategoriju,
  getKategorijeUsluga,
  izmeniKategoriju,
  obrisiKategoriju,
} from '../services/kategorijeService'
import './AdminKategorije.css'

function sortirajKategorije(
  kategorije: KategorijaUsluge[],
) {
  return [...kategorije].sort(
    (a, b) =>
      a.naziv.localeCompare(
        b.naziv,
        'sr',
      ),
  )
}

function AdminKategorije() {
  const [kategorije, setKategorije] =
    useState<KategorijaUsluge[]>([])

  const [noviNaziv, setNoviNaziv] =
    useState('')

  const [izmenaId, setIzmenaId] =
    useState<number | null>(null)

  const [
    nazivZaIzmenu,
    setNazivZaIzmenu,
  ] = useState('')

  const [ucitavanje, setUcitavanje] =
    useState(true)

  const [cuvanje, setCuvanje] =
    useState(false)

  const [brisanjeId, setBrisanjeId] =
    useState<number | null>(null)

  const [greska, setGreska] =
    useState<string | null>(null)

  const [uspeh, setUspeh] =
    useState<string | null>(null)

  useEffect(() => {
    let aktivnaKomponenta = true

    async function ucitajKategorije() {
      try {
        setUcitavanje(true)
        setGreska(null)

        const podaci =
          await getKategorijeUsluga()

        if (!aktivnaKomponenta) {
          return
        }

        setKategorije(
          sortirajKategorije(podaci),
        )
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska(
            'Kategorije nije moguće učitati.',
          )
        }
      } finally {
        if (aktivnaKomponenta) {
          setUcitavanje(false)
        }
      }
    }

    void ucitajKategorije()

    return () => {
      aktivnaKomponenta = false
    }
  }, [])

  async function dodaj(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setGreska(null)
    setUspeh(null)

    const naziv = noviNaziv.trim()

    if (!naziv) {
      setGreska(
        'Naziv kategorije je obavezan.',
      )
      return
    }

    try {
      setCuvanje(true)

      const novaKategorija =
        await dodajKategoriju(naziv)

      setKategorije((prethodne) =>
        sortirajKategorije([
          ...prethodne,
          novaKategorija,
        ]),
      )

      setNoviNaziv('')

      setUspeh(
        'Kategorija je uspešno dodata.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom dodavanja kategorije.',
        )
      }
    } finally {
      setCuvanje(false)
    }
  }

  function pokreniIzmenu(
    kategorija: KategorijaUsluge,
  ) {
    setIzmenaId(kategorija.id)
    setNazivZaIzmenu(kategorija.naziv)
    setGreska(null)
    setUspeh(null)
  }

  function odustaniOdIzmene() {
    setIzmenaId(null)
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

    const naziv =
      nazivZaIzmenu.trim()

    if (!naziv) {
      setGreska(
        'Naziv kategorije je obavezan.',
      )
      return
    }

    try {
      setCuvanje(true)

      const izmenjena =
        await izmeniKategoriju(
          izmenaId,
          naziv,
        )

      setKategorije((prethodne) =>
        sortirajKategorije(
          prethodne.map((kategorija) =>
            kategorija.id ===
            izmenjena.id
              ? izmenjena
              : kategorija,
          ),
        ),
      )

      setIzmenaId(null)
      setNazivZaIzmenu('')

      setUspeh(
        'Kategorija je uspešno izmenjena.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom izmene kategorije.',
        )
      }
    } finally {
      setCuvanje(false)
    }
  }

  async function obrisi(
    kategorija: KategorijaUsluge,
  ) {
    const potvrda = window.confirm(
      `Da li sigurno želiš da obrišeš kategoriju "${kategorija.naziv}"?`,
    )

    if (!potvrda) {
      return
    }

    setGreska(null)
    setUspeh(null)

    try {
      setBrisanjeId(kategorija.id)

      await obrisiKategoriju(
        kategorija.id,
      )

      setKategorije((prethodne) =>
        prethodne.filter(
          (stavka) =>
            stavka.id !== kategorija.id,
        ),
      )

      if (
        izmenaId === kategorija.id
      ) {
        odustaniOdIzmene()
      }

      setUspeh(
        'Kategorija je uspešno obrisana.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom brisanja kategorije.',
        )
      }
    } finally {
      setBrisanjeId(null)
    }
  }

  return (
    <div className="admin-kategorije-stranica">
      <AdminNavigacija />

      <main className="admin-kategorije-sadrzaj">
        <div className="admin-kategorije-naslov">
          <p className="admin-kategorije-nadnaslov">
            Administracija
          </p>

          <h1>Kategorije usluga</h1>

          <p>
            Dodaj, izmeni ili obriši
            kategorije u koje su
            raspoređene usluge salona.
          </p>
        </div>

        <section className="dodavanje-kategorije">
          <h2>Nova kategorija</h2>

          <form
            className="kategorija-forma"
            onSubmit={dodaj}
          >
            <div className="kategorija-polje">
              <label htmlFor="noviNaziv">
                Naziv kategorije
              </label>

              <input
                id="noviNaziv"
                type="text"
                value={noviNaziv}
                onChange={(event) => {
                  setNoviNaziv(
                    event.target.value,
                  )
                  setUspeh(null)
                }}
                placeholder="Na primer: Nega lica"
                required
              />
            </div>

            <button
              type="submit"
              className="kategorija-dugme"
              disabled={cuvanje}
            >
              {cuvanje
                ? 'Čuvanje...'
                : 'Dodaj kategoriju'}
            </button>
          </form>
        </section>

        {greska && (
          <div className="kategorije-poruka kategorije-greska">
            {greska}
          </div>
        )}

        {uspeh && (
          <div className="kategorije-poruka kategorije-uspeh">
            {uspeh}
          </div>
        )}

        <section className="lista-kategorija-sekcija">
          <div className="lista-kategorija-zaglavlje">
            <h2>Postojeće kategorije</h2>

            <span>
              Ukupno: {kategorije.length}
            </span>
          </div>

          {ucitavanje ? (
            <div className="kategorije-status">
              Učitavanje kategorija...
            </div>
          ) : kategorije.length === 0 ? (
            <div className="kategorije-status">
              Trenutno nema definisanih kategorija.
            </div>
          ) : (
            <div className="lista-kategorija">
              {kategorije.map(
                (kategorija) => (
                  <article
                    className="kategorija-red"
                    key={kategorija.id}
                  >
                    {izmenaId ===
                    kategorija.id ? (
                      <form
                        className="izmena-kategorije-forma"
                        onSubmit={
                          sacuvajIzmenu
                        }
                      >
                        <input
                          type="text"
                          value={
                            nazivZaIzmenu
                          }
                          onChange={(
                            event,
                          ) =>
                            setNazivZaIzmenu(
                              event.target
                                .value,
                            )
                          }
                          autoFocus
                          required
                        />

                        <div className="kategorija-akcije">
                          <button
                            type="submit"
                            className="kategorija-malo-dugme kategorija-sacuvaj"
                            disabled={
                              cuvanje
                            }
                          >
                            Sačuvaj
                          </button>

                          <button
                            type="button"
                            className="kategorija-malo-dugme kategorija-odustani"
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
                        <div className="kategorija-podaci">
                          <span className="kategorija-id">
                            #{kategorija.id}
                          </span>

                          <strong>
                            {
                              kategorija.naziv
                            }
                          </strong>
                        </div>

                        <div className="kategorija-akcije">
                          <button
                            type="button"
                            className="kategorija-malo-dugme kategorija-izmeni"
                            onClick={() =>
                              pokreniIzmenu(
                                kategorija,
                              )
                            }
                          >
                            Izmeni
                          </button>

                          <button
                            type="button"
                            className="kategorija-malo-dugme kategorija-obrisi"
                            disabled={
                              brisanjeId ===
                              kategorija.id
                            }
                            onClick={() =>
                              void obrisi(
                                kategorija,
                              )
                            }
                          >
                            {brisanjeId ===
                            kategorija.id
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

export default AdminKategorije