import { useEffect, useState } from 'react';
import { EventJSON } from '../../librairies/ical-js-parser';
import moment from 'moment';
import styles from './Calendar.module.css'
import 'moment/locale/fr';

export default function Calendar({url, eventsIcs}: {url: string, eventsIcs: EventJSON[]}) {
  const [courses, setCourses] = useState<EventJSON[]>(eventsIcs);
  const [coursesOfDay, setCoursesOfDay] = useState<EventJSON[]>([]);
  const [offsetDay, setOffsetDay] = useState(0);
  moment().locale('fr');


  useEffect(() => {

    const coursesOfDay = getEventsOfDay(courses, offsetDay);
    
    setCoursesOfDay(coursesOfDay);
  }, [offsetDay, courses]);
  
  const getEventsOfDay = (events: EventJSON[], offsetDay: number) => {
    const dateOfDay = moment().startOf('day').add(offsetDay, 'days').format('LL');

    const eventsOfDay = events.filter((event) => {
      const dateEvent = moment(event.dtstart.value).format('LL');
      
      if(dateEvent === dateOfDay) {
        return event;
      }
      return null;
    });
  
    return eventsOfDay;
  }
  
  const renderCourses = () => {    
    const currentMoment = moment();
  
    return coursesOfDay.map((cours) => {
      const startCourse = moment(cours.dtstart.value);
      const endCourse = moment(cours.dtend.value);
  
      const isCurrentCourse = currentMoment.isBetween(startCourse, endCourse);
  
      let classNames = `${styles.card}`;
      isCurrentCourse ? classNames += ` ${styles.currentCourse}` : null; 
  
      const durationInMinutes = endCourse.diff(startCourse, 'minutes')
      const duration = moment().startOf('day').add(durationInMinutes, 'minutes').format('HH[H]mm');
  
      return <div key={cours.uid} className={classNames}>
        <p>De {moment(cours.dtstart.value).format('HH:mm')} à {moment(cours.dtend.value).format('HH:mm')} ({duration})</p>
        <p>{cours.location}</p>
        <p>{cours.summary}</p>
      </div>
    })
  }

  const dateOfDay = moment().startOf('day').add(offsetDay, 'days').format('dddd DD/MM/YYYY');

  return (
    <div>
      <div onClick={() => setOffsetDay(0)} >
        <h4>Revenir au jour actuel</h4>
      </div>
      <div className={styles.buttons}>
        <button className={styles.paginButton} onClick={() => setOffsetDay(val => val - 1) }>{"<"}</button>
        <button className={`${styles.paginButton} ${styles.buttonRight}`} onClick={() => setOffsetDay(val => val + 1) }> {">"} </button>
      </div>
      Les cours du {dateOfDay} : 
      {renderCourses()}
    </div>
  );
}