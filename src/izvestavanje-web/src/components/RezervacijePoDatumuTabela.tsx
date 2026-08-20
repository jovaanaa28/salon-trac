import { useEffect, useState } from 'react'

import type {
  RezervacijePoDatumu,
} from '../models/RezervacijePoDatumu'

import {
  getRezervacijePoDatumu,
} from '../services/izvestajiService'

function formatirajDatum(datum: string) {
  const deoDatuma = datum.substring(0, 10)

  const [
    godina,
    mesec,
    dan,
  ] = deoDatuma.split('-')

  return `${dan}.${mesec}.${godina}.`
}

function RezervacijePoDatumuTabela() {
  const [
    rezervacije,
    setRezervacije,
  ] = useState<RezervacijePoDatumu[]>([])

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
          await getRezervacijePoDatumu()

        if (!aktivnaKomponenta) {
          return
        }

        setRezervacije(rezultat)
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

  if (rezervacije.length === 0) {
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
            <th>Datum kreiranja</th>
            <th>Broj rezervacija</th>
          </tr>
        </thead>

        <tbody>
          {rezervacije.map((stavka) => (
            <tr key={stavka.datum}>
              <td>
                {formatirajDatum(stavka.datum)}
              </td>

              <td>
                {stavka.brojRezervacija}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RezervacijePoDatumuTabela