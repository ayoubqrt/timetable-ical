import { useEffect, useState } from 'react';
import { validateICalString } from '../../librairies/ical-js-parser/toJSON/validator';
import toJSON from '../../librairies/ical-js-parser/toJSON';
import { EventJSON } from '../../librairies/ical-js-parser';
import Calendar from '../../src/components/Calendar';
import Image from 'next/image'
import loading from '../../public/images/oval.svg'
import moment from 'moment';
import styles from './Home.module.css'

moment.locale('fr');

export default function Home() {
	const [urlNetypareo, setUrl] = useState("");
	const [icsEvents, setIcsEvents] = useState<EventJSON[]>([]);
	const [error, setError] = useState("");
	const [isIcsValid, setIcsValid] = useState(false);
	const [isFetching, setIsFetching] = useState(false);

	
	useEffect(() => {
		const icsLocal = getIcsInLocalStorage();
		if(icsLocal) {
			const durationInHours = moment().diff(moment(icsLocal.timestamp), 'hours')
			if(durationInHours > 24) {
                setUrl(icsLocal.url);
				retrieveIcsNetyPareo(null);
			} else {
				setIcsEvents(icsLocal.ics)
				setIcsValid(true);
			}
		}
	}, []);

	const retrieveIcsNetyPareo = async (event: any) => {
		if(event) event.preventDefault();
		setIsFetching(true);
		setError("");

		try {
			const res = await fetch(`/api/getIcs?url=${urlNetypareo}`);
			const jsonRes = await res.json();


			if (!res.ok) {
				throw jsonRes.err;
			} else {
				try {
					validateICalString(jsonRes.ics);

					const resultJSON = toJSON(jsonRes.ics);
					setIcsEvents(resultJSON.events);
					saveIcsInLocalStorage(resultJSON.events)
					setIcsValid(true);
				} catch (err) {
					setError("Erreur lors de la lecture du calendrier");
				}

			}
		} catch (err: any) {
			console.log(err);
			setError(err);
		}
	}

	const saveIcsInLocalStorage = (events: EventJSON[]) => {
		const ics = {
			ics: events,
			url: urlNetypareo,
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
			<Calendar url={urlNetypareo} eventsIcs={icsEvents} />
		)
	}

	const invisible = isFetching && !error ? '' : styles.invisible;
	const classesLoading = `${invisible}`;

	return (
		<>
			<form onSubmit={retrieveIcsNetyPareo} id='form' className={styles.form}>
				<input type="text" placeholder='Entrez votre url' className={styles.input}
					value={urlNetypareo} onChange={(event) => setUrl(event.target.value)}>

				</input>
				<button type="submit" className={styles.component}>Valider</button>
			</form>
			<p>{error}</p>

			<Image alt="Chargement..." className={classesLoading} src={loading} height={60} width={60} />
		</>
	);
}