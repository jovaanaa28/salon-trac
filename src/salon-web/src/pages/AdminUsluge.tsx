import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import AdminNavigacija from '../components/AdminNavigacija'
import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import type { Usluga } from '../models/Usluga'
import {
  getKategorijeUsluga,
} from '../services/kategorijeService'
import {
  dodajUslugu,
  getUsluge,
  izmeniUslugu,
  obrisiUslugu,
  type UslugaZahtev,
} from '../services/uslugeService'
import './AdminUsluge.css'

interface FormaUsluge {
  naziv: string
  opis: string
  trajanjeUMinutima: string
  maksimalanBrojKlijenataPoTerminu: string
  vremePocetkaPrvogTermina: string
  vremeZavrsetkaPoslednjegTermina: string
  cena: string
  kategorijaUslugeId: string
}

const praznaForma: FormaUsluge = {
  naziv: '',
  opis: '',
  trajanjeUMinutima: '',
  maksimalanBrojKlijenataPoTerminu: '',
  vremePocetkaPrvogTermina: '',
  vremeZavrsetkaPoslednjegTermina: '',
  cena: '',
  kategorijaUslugeId: '',
}

function sortirajUsluge(
  usluge: Usluga[],
) {
  return [...usluge].sort(
    (a, b) =>
      a.naziv.localeCompare(
        b.naziv,
        'sr',
      ),
  )
}

function formatirajVreme(
  vreme: string,
) {
  return vreme.slice(0, 5)
}

function vremeZaApi(
  vreme: string,
) {
  return vreme.length === 5
    ? `${vreme}:00`
    : vreme
}

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

function AdminUsluge() {
  const [usluge, setUsluge] =
    useState<Usluga[]>([])

  const [kategorije, setKategorije] =
    useState<KategorijaUsluge[]>([])

  const [forma, setForma] =
    useState<FormaUsluge>({
      ...praznaForma,
    })

  const [izmenaId, setIzmenaId] =
    useState<number | null>(null)

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

    async function ucitajPodatke() {
      try {
        setUcitavanje(true)
        setGreska(null)

        const [
          ucitaneUsluge,
          ucitaneKategorije,
        ] = await Promise.all([
          getUsluge(),
          getKategorijeUsluga(),
        ])

        if (!aktivnaKomponenta) {
          return
        }

        setUsluge(
          sortirajUsluge(
            ucitaneUsluge,
          ),
        )

        setKategorije(
          ucitaneKategorije,
        )
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska(
            'Podatke nije moguće učitati.',
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

  function promeniPolje(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) {
    const { name, value } =
      event.target

    setForma((prethodno) => ({
      ...prethodno,
      [name]: value,
    }))

    setGreska(null)
    setUspeh(null)
  }

  function resetujFormu() {
    setForma({
      ...praznaForma,
    })

    setIzmenaId(null)
  }

  function validirajFormu() {
    if (
      !forma.naziv.trim() ||
      !forma.opis.trim()
    ) {
      return 'Naziv i opis usluge su obavezni.'
    }

    const trajanje = Number(
      forma.trajanjeUMinutima,
    )

    if (
      !Number.isInteger(trajanje) ||
      trajanje <= 0
    ) {
      return 'Trajanje mora biti ceo broj veći od 0.'
    }

    const maksimalanBroj =
      Number(
        forma
          .maksimalanBrojKlijenataPoTerminu,
      )

    if (
      !Number.isInteger(
        maksimalanBroj,
      ) ||
      maksimalanBroj <= 0
    ) {
      return 'Maksimalan broj klijenata mora biti ceo broj veći od 0.'
    }

    if (!forma.kategorijaUslugeId) {
      return 'Kategorija je obavezna.'
    }

    if (
      !forma.vremePocetkaPrvogTermina ||
      !forma.vremeZavrsetkaPoslednjegTermina
    ) {
      return 'Vreme prvog i poslednjeg termina je obavezno.'
    }

    if (
      forma.vremePocetkaPrvogTermina >=
      forma.vremeZavrsetkaPoslednjegTermina
    ) {
      return 'Prvi termin mora početi pre završetka poslednjeg termina.'
    }

    if (forma.cena.trim() === '') {
      return 'Cena je obavezna.'
    }

    const cena = Number(
      forma.cena,
    )

    if (
      !Number.isFinite(cena) ||
      cena < 0
    ) {
      return 'Cena ne može biti negativna.'
    }

    return null
  }

  function napraviZahtev():
    UslugaZahtev {
    return {
      naziv: forma.naziv.trim(),
      opis: forma.opis.trim(),
      trajanjeUMinutima: Number(
        forma.trajanjeUMinutima,
      ),
      maksimalanBrojKlijenataPoTerminu:
        Number(
          forma
            .maksimalanBrojKlijenataPoTerminu,
        ),
      vremePocetkaPrvogTermina:
        vremeZaApi(
          forma
            .vremePocetkaPrvogTermina,
        ),
      vremeZavrsetkaPoslednjegTermina:
        vremeZaApi(
          forma
            .vremeZavrsetkaPoslednjegTermina,
        ),
      cena: Number(forma.cena),
      kategorijaUslugeId: Number(
        forma.kategorijaUslugeId,
      ),
    }
  }

  async function sacuvaj(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setGreska(null)
    setUspeh(null)

    const porukaValidacije =
      validirajFormu()

    if (porukaValidacije) {
      setGreska(
        porukaValidacije,
      )
      return
    }

    const zahtev =
      napraviZahtev()

    try {
      setCuvanje(true)

      if (izmenaId === null) {
        const novaUsluga =
          await dodajUslugu(
            zahtev,
          )

        setUsluge((prethodne) =>
          sortirajUsluge([
            ...prethodne,
            novaUsluga,
          ]),
        )

        setUspeh(
          'Usluga je uspešno dodata.',
        )
      } else {
        const izmenjenaUsluga =
          await izmeniUslugu(
            izmenaId,
            zahtev,
          )

        setUsluge((prethodne) =>
          sortirajUsluge(
            prethodne.map(
              (usluga) =>
                usluga.id ===
                izmenjenaUsluga.id
                  ? izmenjenaUsluga
                  : usluga,
            ),
          ),
        )

        setUspeh(
          'Usluga je uspešno izmenjena.',
        )
      }

      resetujFormu()
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom čuvanja usluge.',
        )
      }
    } finally {
      setCuvanje(false)
    }
  }

  function pokreniIzmenu(
    usluga: Usluga,
  ) {
    setIzmenaId(usluga.id)

    setForma({
      naziv: usluga.naziv,
      opis: usluga.opis,
      trajanjeUMinutima:
        String(
          usluga.trajanjeUMinutima,
        ),
      maksimalanBrojKlijenataPoTerminu:
        String(
          usluga
            .maksimalanBrojKlijenataPoTerminu,
        ),
      vremePocetkaPrvogTermina:
        formatirajVreme(
          usluga
            .vremePocetkaPrvogTermina,
        ),
      vremeZavrsetkaPoslednjegTermina:
        formatirajVreme(
          usluga
            .vremeZavrsetkaPoslednjegTermina,
        ),
      cena: String(usluga.cena),
      kategorijaUslugeId:
        String(
          usluga
            .kategorijaUslugeId,
        ),
    })

    setGreska(null)
    setUspeh(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function odustaniOdIzmene() {
    resetujFormu()
    setGreska(null)
    setUspeh(null)
  }

  async function obrisi(
    usluga: Usluga,
  ) {
    const potvrda =
      window.confirm(
        `Da li sigurno želiš da obrišeš uslugu "${usluga.naziv}"?`,
      )

    if (!potvrda) {
      return
    }

    setGreska(null)
    setUspeh(null)

    try {
      setBrisanjeId(usluga.id)

      await obrisiUslugu(
        usluga.id,
      )

      setUsluge((prethodne) =>
        prethodne.filter(
          (stavka) =>
            stavka.id !== usluga.id,
        ),
      )

      if (
        izmenaId === usluga.id
      ) {
        resetujFormu()
      }

      setUspeh(
        'Usluga je uspešno obrisana.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom brisanja usluge.',
        )
      }
    } finally {
      setBrisanjeId(null)
    }
  }

  return (
    <div className="admin-usluge-stranica">
      <AdminNavigacija />

      <main className="admin-usluge-sadrzaj">
        <div className="admin-usluge-naslov">
          <p className="admin-usluge-nadnaslov">
            Administracija
          </p>

          <h1>Usluge</h1>

          <p>
            Dodaj nove usluge i izmeni
            njihove podatke, cenu i
            termine.
          </p>
        </div>

        <section className="usluga-forma-kartica">
          <div className="usluga-forma-naslov">
            <h2>
              {izmenaId === null
                ? 'Nova usluga'
                : 'Izmena usluge'}
            </h2>

            {izmenaId !== null && (
              <button
                type="button"
                className="usluga-odustani-link"
                onClick={
                  odustaniOdIzmene
                }
              >
                Odustani od izmene
              </button>
            )}
          </div>

          {kategorije.length === 0 && (
            <div className="usluge-poruka usluge-greska">
              Pre dodavanja usluge
              potrebno je definisati
              najmanje jednu kategoriju.
            </div>
          )}

          <form
            className="usluga-admin-forma"
            onSubmit={sacuvaj}
          >
            <div className="usluga-forma-grid">
              <div className="usluga-polje">
                <label htmlFor="naziv">
                  Naziv usluge
                </label>

                <input
                  id="naziv"
                  name="naziv"
                  type="text"
                  value={forma.naziv}
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="kategorijaUslugeId">
                  Kategorija
                </label>

                <select
                  id="kategorijaUslugeId"
                  name="kategorijaUslugeId"
                  value={
                    forma
                      .kategorijaUslugeId
                  }
                  onChange={promeniPolje}
                  required
                >
                  <option value="">
                    Izaberi kategoriju
                  </option>

                  {kategorije.map(
                    (kategorija) => (
                      <option
                        key={
                          kategorija.id
                        }
                        value={
                          kategorija.id
                        }
                      >
                        {
                          kategorija.naziv
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="usluga-polje usluga-polje-puno">
                <label htmlFor="opis">
                  Opis
                </label>

                <textarea
                  id="opis"
                  name="opis"
                  rows={4}
                  value={forma.opis}
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="trajanjeUMinutima">
                  Trajanje u minutima
                </label>

                <input
                  id="trajanjeUMinutima"
                  name="trajanjeUMinutima"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    forma
                      .trajanjeUMinutima
                  }
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="maksimalanBrojKlijenataPoTerminu">
                  Maksimalan broj klijenata
                </label>

                <input
                  id="maksimalanBrojKlijenataPoTerminu"
                  name="maksimalanBrojKlijenataPoTerminu"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    forma
                      .maksimalanBrojKlijenataPoTerminu
                  }
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="vremePocetkaPrvogTermina">
                  Prvi termin
                </label>

                <input
                  id="vremePocetkaPrvogTermina"
                  name="vremePocetkaPrvogTermina"
                  type="time"
                  value={
                    forma
                      .vremePocetkaPrvogTermina
                  }
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="vremeZavrsetkaPoslednjegTermina">
                  Poslednji termin
                </label>

                <input
                  id="vremeZavrsetkaPoslednjegTermina"
                  name="vremeZavrsetkaPoslednjegTermina"
                  type="time"
                  value={
                    forma
                      .vremeZavrsetkaPoslednjegTermina
                  }
                  onChange={promeniPolje}
                  required
                />
              </div>

              <div className="usluga-polje">
                <label htmlFor="cena">
                  Cena u RSD
                </label>

                <input
                  id="cena"
                  name="cena"
                  type="number"
                  min="0"
                  step="0.01"
                  value={forma.cena}
                  onChange={promeniPolje}
                  required
                />
              </div>
            </div>

            {greska && (
              <div className="usluge-poruka usluge-greska">
                {greska}
              </div>
            )}

            {uspeh && (
              <div className="usluge-poruka usluge-uspeh">
                {uspeh}
              </div>
            )}

            <div className="usluga-forma-akcije">
              <button
                type="submit"
                className="usluga-glavno-dugme"
                disabled={
                  cuvanje ||
                  kategorije.length === 0
                }
              >
                {cuvanje
                  ? 'Čuvanje...'
                  : izmenaId === null
                    ? 'Dodaj uslugu'
                    : 'Sačuvaj izmene'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-lista-usluga">
          <div className="admin-lista-usluga-zaglavlje">
            <h2>
              Postojeće usluge
            </h2>

            <span>
              Ukupno: {usluge.length}
            </span>
          </div>

          {ucitavanje ? (
            <div className="usluge-status">
              Učitavanje usluga...
            </div>
          ) : usluge.length === 0 ? (
            <div className="usluge-status">
              Trenutno nema definisanih usluga.
            </div>
          ) : (
            <div className="admin-usluge-lista">
              {usluge.map(
                (usluga) => (
                  <article
                    className="admin-usluga-kartica"
                    key={usluga.id}
                  >
                    <div className="admin-usluga-vrh">
                      <div>
                        <span className="admin-usluga-kategorija">
                          {usluga.kategorijaNaziv ??
                            'Bez kategorije'}
                        </span>

                        <h3>
                          {
                            usluga.naziv
                          }
                        </h3>
                      </div>

                      <strong className="admin-usluga-cena">
                        {formatirajCenu(
                          usluga.cena,
                        )}{' '}
                        RSD
                      </strong>
                    </div>

                    <p className="admin-usluga-opis">
                      {usluga.opis}
                    </p>

                    <div className="admin-usluga-detalji">
                      <div>
                        <span>
                          Trajanje
                        </span>

                        <strong>
                          {
                            usluga
                              .trajanjeUMinutima
                          }{' '}
                          min
                        </strong>
                      </div>

                      <div>
                        <span>
                          Maks. klijenata
                        </span>

                        <strong>
                          {
                            usluga
                              .maksimalanBrojKlijenataPoTerminu
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Termini
                        </span>

                        <strong>
                          {formatirajVreme(
                            usluga
                              .vremePocetkaPrvogTermina,
                          )}
                          {' – '}
                          {formatirajVreme(
                            usluga
                              .vremeZavrsetkaPoslednjegTermina,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-usluga-akcije">
                      <button
                        type="button"
                        className="usluga-malo-dugme usluga-izmeni-dugme"
                        onClick={() =>
                          pokreniIzmenu(
                            usluga,
                          )
                        }
                      >
                        Izmeni
                      </button>

                      <button
                        type="button"
                        className="usluga-malo-dugme usluga-obrisi-dugme"
                        disabled={
                          brisanjeId ===
                          usluga.id
                        }
                        onClick={() =>
                          void obrisi(
                            usluga,
                          )
                        }
                      >
                        {brisanjeId ===
                        usluga.id
                          ? 'Brisanje...'
                          : 'Obriši'}
                      </button>
                    </div>
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

export default AdminUsluge