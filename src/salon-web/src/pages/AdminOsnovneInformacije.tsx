import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import AdminNavigacija from '../components/AdminNavigacija'
import type { OsnovneInformacije } from '../models/OsnovneInformacije'
import {
  getOsnovneInformacije,
  sacuvajOsnovneInformacije,
} from '../services/osnovneInformacijeService'
import './AdminOsnovneInformacije.css'

const prazneInformacije: OsnovneInformacije = {
  naziv: '',
  lokacija: '',
  opis: '',
  radnoVreme: '',
}

function AdminOsnovneInformacije() {
  const [forma, setForma] =
    useState<OsnovneInformacije>(
      prazneInformacije,
    )

  const [ucitavanje, setUcitavanje] =
    useState(true)

  const [cuvanje, setCuvanje] =
    useState(false)

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

        const podaci =
          await getOsnovneInformacije()

        if (!aktivnaKomponenta) {
          return
        }

        setForma(podaci)
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska(
            'Osnovne informacije nije moguće učitati.',
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
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target

    setForma((prethodno) => ({
      ...prethodno,
      [name]: value,
    }))

    setUspeh(null)
  }

  async function sacuvaj(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setGreska(null)
    setUspeh(null)

    const podaciZaCuvanje = {
      naziv: forma.naziv.trim(),
      lokacija: forma.lokacija.trim(),
      opis: forma.opis.trim(),
      radnoVreme: forma.radnoVreme.trim(),
    }

    if (
      !podaciZaCuvanje.naziv ||
      !podaciZaCuvanje.lokacija ||
      !podaciZaCuvanje.opis ||
      !podaciZaCuvanje.radnoVreme
    ) {
      setGreska(
        'Sva polja su obavezna.',
      )
      return
    }

    try {
      setCuvanje(true)

      const sacuvaniPodaci =
        await sacuvajOsnovneInformacije(
          podaciZaCuvanje,
        )

      setForma(sacuvaniPodaci)

      setUspeh(
        'Osnovne informacije su uspešno sačuvane.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message)
      } else {
        setGreska(
          'Došlo je do greške prilikom čuvanja podataka.',
        )
      }
    } finally {
      setCuvanje(false)
    }
  }

  return (
    <div className="admin-stranica">
      <AdminNavigacija />

      <main className="admin-glavni-sadrzaj">
        <div className="admin-naslov">
          <p className="admin-nadnaslov">
            Administracija
          </p>

          <h1>Osnovne informacije</h1>

          <p>
            Izmeni podatke koji se prikazuju
            na početnoj stranici salona.
          </p>
        </div>

        {ucitavanje ? (
          <div className="admin-status">
            Učitavanje podataka...
          </div>
        ) : (
          <form
            className="admin-forma"
            onSubmit={sacuvaj}
          >
            <div className="admin-polje">
              <label htmlFor="naziv">
                Naziv salona
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

            <div className="admin-polje">
              <label htmlFor="lokacija">
                Lokacija
              </label>

              <input
                id="lokacija"
                name="lokacija"
                type="text"
                value={forma.lokacija}
                onChange={promeniPolje}
                required
              />
            </div>

            <div className="admin-polje">
              <label htmlFor="opis">
                Opis
              </label>

              <textarea
                id="opis"
                name="opis"
                rows={6}
                value={forma.opis}
                onChange={promeniPolje}
                required
              />
            </div>

            <div className="admin-polje">
              <label htmlFor="radnoVreme">
                Radno vreme
              </label>

              <input
                id="radnoVreme"
                name="radnoVreme"
                type="text"
                value={forma.radnoVreme}
                onChange={promeniPolje}
                placeholder="Pon-Pet 09:00-20:00"
                required
              />
            </div>

            {greska && (
              <div className="admin-poruka admin-greska">
                {greska}
              </div>
            )}

            {uspeh && (
              <div className="admin-poruka admin-uspeh">
                {uspeh}
              </div>
            )}

            <div className="admin-akcije">
              <button
                type="submit"
                className="admin-dugme"
                disabled={cuvanje}
              >
                {cuvanje
                  ? 'Čuvanje...'
                  : 'Sačuvaj izmene'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default AdminOsnovneInformacije