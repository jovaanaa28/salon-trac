import { useEffect, useState } from 'react'
import type {
  TerminiPoKategoriji,
} from '../models/TerminiPoKategoriji'
import {
  getTerminiPoKategoriji,
} from '../services/izvestajiService'
const OSVEZAVANJE_MS = 5000
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
          await getTerminiPoKategoriji()
        if (!aktivnaKomponenta) {
          return
        }
        setTermini(rezultat)
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
            <th>
              Broj rezervisanih termina
            </th>
          </tr>
        </thead>
        <tbody>
          {termini.map((stavka) => (
            <tr
              key={
                stavka.kategorijaUslugeId
              }
            >
              <td>
                {stavka.nazivKategorije}
              </td>
              <td>
                {
                  stavka
                    .brojRezervisanihTermina
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default TerminiPoKategorijiTabela