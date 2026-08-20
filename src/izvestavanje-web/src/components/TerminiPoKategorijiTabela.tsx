import { useEffect, useState } from 'react'

import type {
  TerminiPoKategoriji,
} from '../models/TerminiPoKategoriji'

import {
  getTerminiPoKategoriji,
} from '../services/izvestajiService'

function TerminiPoKategorijiTabela() {
  const [
    termini,
    setTermini,
  ] = useState<TerminiPoKategoriji[]>([])

  const [
    ucitavanje,
    setUcitavanje,
  ] = useState(true)

  const [
    greska,
    setGreska,
  ] = useState<string | null>(null)

  useEffect(() => {
    let aktivnaKomponenta = true

    async function ucitaj() {
      try {
        setUcitavanje(true)
        setGreska(null)

        const rezultat =
          await getTerminiPoKategoriji()

        if (!aktivnaKomponenta) {
          return
        }

        setTermini(rezultat)
      } catch (error) {
        if (!aktivnaKomponenta) {
          return
        }

        if (error instanceof Error) {
          setGreska(error.message)
        } else {
          setGreska(
            'Izveštaj trenutno nije moguće učitati.',
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
  }, [])

  if (ucitavanje) {
    return (
      <p className="status-izvestaja">
        Učitavanje izveštaja...
      </p>
    )
  }

  if (greska) {
    return (
      <p className="status-izvestaja greska">
        {greska}
      </p>
    )
  }

  if (termini.length === 0) {
    return (
      <p className="status-izvestaja">
        Trenutno nema podataka za prikaz.
      </p>
    )
  }

  return (
    <div className="tabela-okvir">
      <table className="izvestaj-tabela">
        <thead>
          <tr>
            <th>Kategorija usluge</th>
            <th>Broj rezervisanih termina</th>
          </tr>
        </thead>

        <tbody>
          {termini.map((stavka) => (
            <tr key={stavka.kategorijaUslugeId}>
              <td>
                {stavka.nazivKategorije}
              </td>

              <td>
                {stavka.brojRezervisanihTermina}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TerminiPoKategorijiTabela