import { useEffect, useState } from 'react'

import type {
  RezervacijePoDatumu,
} from '../models/RezervacijePoDatumu'

import {
  getRezervacijePoDatumu,
} from '../services/izvestajiService'

const OSVEZAVANJE_MS = 5000

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
    let zahtevUToku = false
    let prvoUcitavanje = true

    async function ucitaj() {
      if (zahtevUToku) {
        return
      }

      zahtevUToku = true

      try {
        if (
          aktivnaKomponenta &&
          prvoUcitavanje
        ) {
          setUcitavanje(true)
        }

        const rezultat =
          await getRezervacijePoDatumu()

        if (!aktivnaKomponenta) {
          return
        }

        setRezervacije(rezultat)
        setGreska(null)
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
        if (
          aktivnaKomponenta &&
          prvoUcitavanje
        ) {
          setUcitavanje(false)
          prvoUcitavanje = false
        }

        zahtevUToku = false
      }
    }

    void ucitaj()

    const intervalId = window.setInterval(
      () => {
        void ucitaj()
      },
      OSVEZAVANJE_MS,
    )

    return () => {
      aktivnaKomponenta = false
      window.clearInterval(intervalId)
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
                {
                  formatirajDatum(
                    stavka.datum,
                  )
                }
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