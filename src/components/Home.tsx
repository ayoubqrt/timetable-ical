import { useEffect, useMemo, useState } from "react";
import Calendar from "../../src/components/Calendar";
import Image from "next/image";
import loading from "../../public/images/oval.svg";
import reload from "../../public/images/reload.svg";
import moment from "moment";
import styles from "./Home.module.css";
import toast, { Toaster } from "react-hot-toast";
import { getAllSubjectColors } from "../helpers/CoursesHelpers";
const ical2json = require("ical2json");
moment.locale("fr");

interface VCalendar {
  VEVENT: VEvent[];
  VERSION: string;
  PRODID: string;
  CALSCALE: string;
  METHOD: string;
  "X-WR-TIMEZONE": string;
  "X-WR-CALNAME": string;
  "X-WR-CALDESC": string;
}

export interface VEvent {
  UID: string;
  DESCRIPTION: string;
  DTEND: string;
  DTSTAMP: string;
  DTSTART: string;
  LOCATION: string;
  SUMMARY: string;
}

export interface ICSJson {
  ics: string;
}

type ICS = {
  ics: VEvent[];
  url: string;
  timestamp: number;
  subjectColors: Map<string, string>;
};

export default function Home() {
  const [urlNetypareo, setUrl] = useState("");
  const [icsEvents, setIcsEvents] = useState<VEvent[]>([]);
  const [error, setError] = useState("");
  const [isIcsValid, setIcsValid] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [subjectColors, setSubjectColors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const icsLocal = getIcsInLocalStorage();
    if (icsLocal) {
      const durationInHours = moment().diff(moment(icsLocal.timestamp), "hours");
      if (durationInHours > 24) {
        retrieveIcsNetyPareo(null, icsLocal.url);
      } else {
        setIcsEvents(icsLocal.ics);
        setIcsValid(true);
        setSubjectColors(icsLocal.subjectColors);

        //async refresh of edt
        retrieveAsyncIcsNetyPareo(icsLocal.url);
      }
    }
  }, []);

  const retrieveAsyncIcsNetyPareo = (url: string) => {
    toast.promise(retrieveIcsNetyPareo(null, url), {
      loading: "Mise à jour de l'EDT...",
      success: <b>EDT mis à jour avec succès</b>,
      error: <b>Erreur lors de la mis à jour de l&apos;EDT.</b>,
    });
  };

  const retrieveIcsNetyPareo = async (event: any, url?: string) => {
    if (event) event.preventDefault();

    setIsFetching(true);
    setError("");

    const urlIcs = url ? url : urlNetypareo;
    const jsonRes = await fetchApiNetypareo(urlIcs);

    if (jsonRes) {
      try {
        const calendarsJSON = ical2json.convert(jsonRes.ics);
        const calendar: VCalendar = calendarsJSON.VCALENDAR[0];
        const events = calendar.VEVENT;
        const subjectColors = getAllSubjectColors(events);

        setIcsEvents(events);
        setSubjectColors(subjectColors);
        saveIcsInLocalStorage(events, urlIcs, subjectColors);
        setIcsValid(true);

        setIsFetching(false);
      } catch (err) {
        setError("Erreur lors de la lecture du calendrier");
        setIsFetching(false);
        console.log(err);

        return new Error();
      }
    }
  };

  const fetchApiNetypareo = async (urlIcs: string): Promise<ICSJson | null> => {
    try {
      const res = await fetch(`/api/getIcs?url=${urlIcs}`);
      const jsonRes = await res.json();

      if (!res.ok) {
        throw jsonRes.err;
      }

      return jsonRes;
    } catch (err: any) {
      console.log(err);
      setIsFetching(false);
      setError(err);

      return Promise.reject(new Error());
    }
  };

  const saveIcsInLocalStorage = (events: VEvent[], urlIcs: string, subjectColors: Map<string, string>) => {
    const ics = {
      ics: events,
      url: urlIcs,
      timestamp: new Date(),
      subjectsColors: JSON.stringify(Array.from(subjectColors.entries())),
    };

    localStorage.setItem("ics", JSON.stringify(ics));
  };

  const getIcsInLocalStorage = (): ICS | null => {
    const icsLocal = localStorage.getItem("ics");
    if (icsLocal) {
      const json = JSON.parse(icsLocal);
      const subjectColors: Map<string, string> = new Map(JSON.parse(json.subjectsColors));
      return { ics: json.ics, url: json.url, timestamp: json.timestamp, subjectColors: subjectColors };
    }

    return null;
  };

  if (isIcsValid) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        {/* <div className={styles.reload}>
					<button onClick={() => forceReloadIcs()}>			
						<Image alt="Rafraîchir" src={reload} height={10} width={10} />
					</button>
				</div> */}
        <Calendar url={urlNetypareo} eventsIcs={icsEvents} subjectColors={subjectColors} />
      </>
    );
  }

  const invisible = isFetching && !error ? "" : styles.invisible;
  const classesLoading = `${invisible}`;

  return (
    <>
      <form onSubmit={(event) => retrieveIcsNetyPareo(event)} id="form" className={styles.form}>
        <input
          disabled={isFetching}
          type="text"
          placeholder="Entrez votre url"
          className={styles.input}
          value={urlNetypareo}
          onChange={(event) => setUrl(event.target.value)}
        ></input>
        <button type="submit" className={`${styles.component} ${styles.reload}`} disabled={isFetching}>
          Valider
        </button>
      </form>
      <p>{error}</p>

      {/* <Image alt="Chargement..." className={classesLoading} src={loading} height={60} width={60} /> */}
    </>
  );
}
