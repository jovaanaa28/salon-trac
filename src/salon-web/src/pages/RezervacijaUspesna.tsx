import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Zaglavlje from "../components/Zaglavlje";
import type { StatusRezervacije } from "../models/StatusRezervacije";
import { getStatusRezervacije } from "../services/rezervacijeService";
import "./RezervacijaUspesna.css";
const MAKSIMALAN_BROJ_PROVERA = 40;
const VREME_IZMEDJU_PROVERA = 1500;
function RezervacijaUspesna() {
  const { idZahteva } = useParams<{
    idZahteva: string;
  }>();
  const [status, setStatus] = useState<StatusRezervacije | null>(null);
  const [greska, setGreska] = useState<string | null>(null);
  const [proveravanje, setProveravanje] = useState(true);
  const [istekloCekanje, setIstekloCekanje] = useState(false);
  const brojProvera = useRef(0);
  const proveriStatus = useCallback(
    async function proveriStatus() {
      if (!idZahteva) {
        setGreska("Nedostaje identifikator zahteva za rezervaciju.");
        setProveravanje(false);
        return;
      }
      try {
        setGreska(null);
        const rezultat = await getStatusRezervacije(idZahteva);
        setStatus(rezultat);
        if (rezultat.status === "USPESNA" || rezultat.status === "ODBIJENA") {
          setProveravanje(false);
          return;
        }
        brojProvera.current += 1;
        if (brojProvera.current >= MAKSIMALAN_BROJ_PROVERA) {
          setProveravanje(false);
          setIstekloCekanje(true);
        }
      } catch (error) {
        setProveravanje(false);
        if (error instanceof Error) {
          setGreska(error.message);
        } else {
          setGreska("Status rezervacije trenutno nije moguće proveriti.");
        }
      }
    },
    [idZahteva],
  );
  useEffect(() => {
    void proveriStatus();
  }, [proveriStatus]);
  useEffect(() => {
    if (
      !proveravanje ||
      !status ||
      status.status === "USPESNA" ||
      status.status === "ODBIJENA"
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      void proveriStatus();
    }, VREME_IZMEDJU_PROVERA);
    return () => {
      window.clearTimeout(timer);
    };
  }, [proveravanje, status, proveriStatus]);
  function proveriPonovo() {
    brojProvera.current = 0;
    setIstekloCekanje(false);
    setProveravanje(true);
    setGreska(null);
    void proveriStatus();
  }
  function kopiraj(vrednost: string) {
    void navigator.clipboard.writeText(vrednost);
  }
  const uspesna = status?.status === "USPESNA";
  const odbijena = status?.status === "ODBIJENA";
  const obradaUToku = status && !uspesna && !odbijena;
  return (
    <div className="rezultat-rezervacije-stranica">
      <Zaglavlje />
      <main className="rezultat-rezervacije-sadrzaj">
        {greska ? (
          <section className="rezultat-kartica rezultat-greska-kartica">
            <div className="rezultat-ikona">!</div>
            <h1>Status nije moguće učitati</h1>
            <p>{greska}</p>
            <button
              type="button"
              className="rezultat-glavno-dugme"
              onClick={proveriPonovo}
            >
              Pokušaj ponovo
            </button>
          </section>
        ) : uspesna ? (
          <section className="rezultat-kartica rezultat-uspeh-kartica">
            <div className="rezultat-ikona rezultat-ikona-uspeh">✓</div>
            <p className="rezultat-nadnaslov">Rezervacija potvrđena</p>
            <h1>Rezervacija je uspešno napravljena</h1>
            <p className="rezultat-opis">
              Sačuvaj pristupnu šifru. Biće ti potrebna zajedno sa email adresom
              za kasniji pregled, izmenu ili otkazivanje rezervacije.
            </p>
            <div className="rezultat-podaci">
              <div className="rezultat-podatak">
                <span>Pristupna šifra</span>
                <div className="rezultat-vrednost-red">
                  <strong className="rezultat-kod">
                    {status.sifra ?? "Nije dostupna"}
                  </strong>
                  {status.sifra && (
                    <button
                      type="button"
                      className="rezultat-kopiraj"
                      onClick={() => kopiraj(status.sifra!)}
                    >
                      Kopiraj
                    </button>
                  )}
                </div>
              </div>
              <div className="rezultat-podatak">
                <span>Promo kod za sledeću rezervaciju</span>
                <div className="rezultat-vrednost-red">
                  <strong className="rezultat-kod">
                    {status.promoKod ?? "Nije dostupan"}
                  </strong>
                  {status.promoKod && (
                    <button
                      type="button"
                      className="rezultat-kopiraj"
                      onClick={() => kopiraj(status.promoKod!)}
                    >
                      Kopiraj
                    </button>
                  )}
                </div>
                <small>
                  Ovaj promo kod donosi dodatnih 5% popusta prilikom sledeće
                  rezervacije.
                </small>
              </div>
            </div>
            <div className="rezultat-informacije">
              <div>
                <span>Broj rezervacije</span>
                <strong>#{status.rezervacijaId}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>Aktivna</strong>
              </div>
            </div>
            <div className="rezultat-upozorenje">
              <strong>Važno</strong>
              <p>
                Pristupna šifra se koristi zajedno sa email adresom. Sačuvaj je
                na sigurnom mestu.
              </p>
            </div>
            <div className="rezultat-akcije">
              <Link
                to="/"
                className="rezultat-glavno-dugme rezultat-link-dugme"
              >
                Nazad na početnu
              </Link>
              <Link
                to="/rezervacija"
                className="rezultat-sekundarno-dugme rezultat-link-dugme"
              >
                Nova rezervacija
              </Link>
            </div>
          </section>
        ) : odbijena ? (
          <section className="rezultat-kartica rezultat-greska-kartica">
            <div className="rezultat-ikona">!</div>
            <p className="rezultat-nadnaslov">Rezervacija nije napravljena</p>
            <h1>Zahtev je odbijen</h1>
            <p className="rezultat-opis">{status.poruka}</p>
            <div className="rezultat-akcije">
              <Link
                to="/rezervacija"
                className="rezultat-glavno-dugme rezultat-link-dugme"
              >
                Pokušaj ponovo
              </Link>
              <Link
                to="/"
                className="rezultat-sekundarno-dugme rezultat-link-dugme"
              >
                Nazad na početnu
              </Link>
            </div>
          </section>
        ) : (
          <section className="rezultat-kartica rezultat-cekanje-kartica">
            <div className="rezultat-spinner" />
            <p className="rezultat-nadnaslov">Obrada rezervacije</p>
            <h1>
              {istekloCekanje
                ? "Obrada još nije završena"
                : "Rezervacija se obrađuje"}
            </h1>
            <p className="rezultat-opis">
              {istekloCekanje
                ? "Obrada traje duže nego obično. Zahtev nije izgubljen i status možeš proveriti ponovo."
                : (status?.poruka ??
                  "Sačekaj nekoliko trenutaka dok proveravamo rezervaciju.")}
            </p>
            {obradaUToku && (
              <div className="rezultat-status-box">
                <span>Trenutni status</span>
                <strong>{status.status}</strong>
              </div>
            )}
            <div className="rezultat-id-zahteva">
              <span>ID zahteva</span>
              <code>{idZahteva}</code>
            </div>
            {istekloCekanje && (
              <button
                type="button"
                className="rezultat-glavno-dugme"
                onClick={proveriPonovo}
              >
                Proveri ponovo
              </button>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
export default RezervacijaUspesna;
