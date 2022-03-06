import { useEffect, useState } from 'react';
import Calendar from '../../src/components/Calendar';
import Image from 'next/image'
import loading from '../../public/images/oval.svg'
import reload from '../../public/images/reload.svg'
import moment from 'moment';
import styles from './Home.module.css'
const ical2json = require("ical2json");

moment.locale('fr');

interface VCalendar {
	VEVENT: VEvent[];
	VERSION : string;
	PRODID : string;
	CALSCALE : string;
	METHOD : string;
	"X-WR-TIMEZONE": string;
	"X-WR-CALNAME" : string;
	"X-WR-CALDESC" : string;
}

export interface VEvent {
	UID: string;
	DESCRIPTION: string;
	DTEND:  string;
	DTSTAMP: string;
	DTSTART: string;
	LOCATION: string;
	SUMMARY: string;
}

export default function Home() {
	const [urlNetypareo, setUrl] = useState("");
	const [icsEvents, setIcsEvents] = useState<VEvent[]>([]);
	const [error, setError] = useState("");
	const [isIcsValid, setIcsValid] = useState(false);
	const [isFetching, setIsFetching] = useState(false);

	
	useEffect(() => {
		localStorage.removeItem("ics")
		const icsLocal = getIcsInLocalStorage();
		if(icsLocal) {
			const durationInHours = moment().diff(moment(icsLocal.timestamp), 'hours')
			if(durationInHours > 24) {
				retrieveIcsNetyPareo(null, icsLocal.url);
			} else {
				setIcsEvents(icsLocal.ics)
				setIcsValid(true);
			}
		}
	}, []);

	const retrieveIcsNetyPareo = async (event: any, url?: string) => {
		if(event) event.preventDefault();
		setIsFetching(true);
		setError("");

		const urlIcs = url ? url : urlNetypareo;

		try {
			const res = await fetch(`/api/getIcs?url=${urlIcs}`);
			const jsonRes = await res.json();

			if (!res.ok) {
				throw jsonRes.err;
			} else {
				try {
					const calendarsJSON = ical2json.convert(jsonRes.ics);
					const calendar: VCalendar = calendarsJSON.VCALENDAR[0];
					
					setIcsEvents(calendar.VEVENT);
					saveIcsInLocalStorage(calendar.VEVENT, urlIcs)
					setIcsValid(true);
				} catch (err) {
					setError("Erreur lors de la lecture du calendrier");
					setIsFetching(false);
				}

			}
		} catch (err: any) {
			console.log(err);
			setIsFetching(false);
			setError(err);
		}
	}

	const forceReloadIcs = () => {
		setIcsValid(false);
		const icsLocal = getIcsInLocalStorage();

		retrieveIcsNetyPareo(null, icsLocal.url);
	}

	const saveIcsInLocalStorage = (events: VEvent[], urlIcs: string) => {
		const ics = {
			ics: events,
			url: urlIcs,
			timestamp: new Date()
		}

		localStorage.setItem("ics", JSON.stringify(ics));
	}

	const getIcsInLocalStorage = () => {
		const icsLocal = localStorage.getItem("ics");
		if(icsLocal) {
			return JSON.parse(icsLocal);
		}

		return null;
	}

	if (isIcsValid) {
		return (
			<>
				<button className={styles.reload} onClick={() => forceReloadIcs()}>			
					<Image alt="Rafraîchir" src={reload} height={10} width={10} />
				</button>
				<Calendar url={urlNetypareo} eventsIcs={icsEvents} />
			</>
		)
	}

	const invisible = isFetching && !error ? '' : styles.invisible;
	const classesLoading = `${invisible}`;

	return (
		<>
			<form onSubmit={(event) => retrieveIcsNetyPareo(event)} id='form' className={styles.form}>
				<input disabled={isFetching} type="text" placeholder='Entrez votre url' className={styles.input}
					value={urlNetypareo} onChange={(event) => setUrl(event.target.value)}>

				</input>
				<button type="submit" className={styles.component} disabled={isFetching}>Valider</button>
			</form>
			<p>{error}</p>

			<Image alt="Chargement..." className={classesLoading} src={loading} height={60} width={60} />
		</>
	);
}