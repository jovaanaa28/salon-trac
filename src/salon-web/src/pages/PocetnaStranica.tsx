import { useEffect, useState } from 'react'
import Zaglavlje from '../components/Zaglavlje'
import type { OsnovneInformacije } from '../models/OsnovneInformacije'
import type { KategorijaUsluge } from '../models/KategorijaUsluge'
import type { Usluga } from '../models/Usluga'
import {
  getKategorijeUsluga,
  getOsnovneInformacije,
  getUsluge,
} from '../services/pocetnaService'
import './PocetnaStranica.css'

function PocetnaStranica() {
  const [osnovneInformacije, setOsnovneInformacije] =
    useState<OsnovneInformacije | null>(null)

  const [kategorije, setKategorije] =
    useState<KategorijaUsluge[]>([])

  const [usluge, setUsluge] =
    useState<Usluga[]>([])

  const [ucitavanje, setUcitavanje] =
    useState(true)

  const [greska, setGreska] =
    useState<string | null>(null)

  useEffect(() => {
    let aktivnaKomponenta = true

    async function ucitajPodatke() {
      try {
        setUcitavanje(true)
        setGreska(null)

        const [
          osnovne,
          ucitaneKategorije,
          ucitaneUsluge,
        ] = await Promise.all([
          getOsnovneInformacije(),
          getKategorijeUsluga(),
          getUsluge(),
        ])

        if (!aktivnaKomponenta) {
          return
        }

        setOsnovneInformacije(osnovne)
        setKategorije(ucitaneKategorije)
        setUsluge(ucitaneUsluge)
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska('Podaci trenutno nisu dostupni.')
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

  function formatirajVreme(vreme: string) {
    return vreme.slice(0, 5)
  }

  function formatirajCenu(cena: number) {
    return new Intl.NumberFormat(
      'sr-RS',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(cena)
  }

  if (ucitavanje) {
    return (
      <div className="status-stranica">
        <p>Učitavanje podataka...</p>
      </div>
    )
  }

  if (greska) {
    return (
      <div className="status-stranica">
        <h1>Salon Trač</h1>
        <p className="greska">{greska}</p>
      </div>
    )
  }

  if (!osnovneInformacije) {
    return (
      <div className="status-stranica">
        <p>Osnovne informacije salona nisu dostupne.</p>
      </div>
    )
  }

  return (
    <div className="pocetna-stranica">
      <Zaglavlje />

      <main>
        <section
          id="o-salonu"
          className="hero-sekcija"
        >
          <div className="hero-sadrzaj">
            <p className="nadnaslov">
              Salon lepote
            </p>

            <h1>
              {osnovneInformacije.naziv}
            </h1>

            <p className="opis-salona">
              {osnovneInformacije.opis}
            </p>

            <div className="informacije-salona">
              <div>
                <span>Lokacija</span>
                <strong>
                  {osnovneInformacije.lokacija}
                </strong>
              </div>

              <div>
                <span>Radno vreme</span>
                <strong>
                  {osnovneInformacije.radnoVreme}
                </strong>
              </div>
            </div>

            <a
              href="#usluge"
              className="glavno-dugme"
            >
              Pogledaj usluge
            </a>
          </div>
        </section>

        <section
          id="usluge"
          className="usluge-sekcija"
        >
          <div className="naslov-sekcije">
            <p className="nadnaslov">
              Naša ponuda
            </p>

            <h2>Usluge</h2>

            <p>
              Izaberi kategoriju i pronađi uslugu
              koja ti odgovara.
            </p>
          </div>

          {kategorije.length === 0 ? (
            <p className="prazna-lista">
              Trenutno nema definisanih kategorija usluga.
            </p>
          ) : (
            <div className="kategorije">
              {kategorije.map((kategorija) => {
                const uslugeKategorije =
                  usluge.filter(
                    (usluga) =>
                      usluga.kategorijaUslugeId ===
                      kategorija.id,
                  )

                return (
                  <section
                    className="kategorija"
                    key={kategorija.id}
                  >
                    <h3>{kategorija.naziv}</h3>

                    {uslugeKategorije.length === 0 ? (
                      <p className="prazna-lista">
                        U ovoj kategoriji trenutno nema usluga.
                      </p>
                    ) : (
                      <div className="usluge-grid">
                        {uslugeKategorije.map(
                          (usluga) => (
                            <article
                              className="usluga-kartica"
                              key={usluga.id}
                            >
                              <div className="usluga-vrh">
                                <h4>
                                  {usluga.naziv}
                                </h4>

                                <span className="cena">
                                  {formatirajCenu(
                                    usluga.cena,
                                  )}{' '}
                                  RSD
                                </span>
                              </div>

                              <p className="opis-usluge">
                                {usluga.opis}
                              </p>

                              <div className="detalji-usluge">
                                <span>
                                  Trajanje:{' '}
                                  {
                                    usluga.trajanjeUMinutima
                                  }{' '}
                                  min
                                </span>

                                <span>
                                  Termini:{' '}
                                  {formatirajVreme(
                                    usluga.vremePocetkaPrvogTermina,
                                  )}
                                  {' – '}
                                  {formatirajVreme(
                                    usluga.vremeZavrsetkaPoslednjegTermina,
                                  )}
                                </span>
                              </div>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="podnozje">
        <p>
          {osnovneInformacije.naziv} ·{' '}
          {osnovneInformacije.lokacija}
        </p>
      </footer>
    </div>
  )
}

export default PocetnaStranica