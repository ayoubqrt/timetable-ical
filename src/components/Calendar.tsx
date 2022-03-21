import { useEffect, useState } from 'react';
import moment from 'moment';
import styles from './Calendar.module.css'
import 'moment/locale/fr';
import { VEvent } from './Home';
moment().locale('fr');


export default function Calendar({url, eventsIcs}: {url: string, eventsIcs: VEvent[]}) {
  const [courses, setCourses] = useState<VEvent[]>([]);
  const [coursesOfDay, setCoursesOfDay] = useState<VEvent[]>([]);
  const [coursesOfWeek, setCoursesOfWeek] = useState<VEvent[]>([]);
  const [offsetDay, setOffsetDay] = useState(0);
  const [offsetWeek, setOffsetWeek] = useState(0);
  const [isDayView, setIsDayView] = useState(true);

  useEffect(() => {
    setCourses(eventsIcs);
    console.log("edt refreshed")
  }, [eventsIcs]);

  useEffect(() => {
    const coursesOfDay = getEventsOfDay(courses, offsetDay);
    
    setCoursesOfDay(coursesOfDay);
  }, [offsetDay, courses]);

  useEffect(() => {
    const coursesOfWeek = getEventsOfWeek(courses, offsetWeek);
    
    setCoursesOfWeek(coursesOfWeek);
  }, [offsetWeek, courses]);

  useEffect(() => {
    window.scrollTo(0, 0);
  })
  
  const getEventsOfDay = (events: VEvent[], offsetDay: number) => {
    const dateOfDay = moment().startOf('day').add(offsetDay, 'days').format('LL');

    const eventsOfDay = events.filter((event) => {
      const dateEvent = moment(event.DTSTART).format('LL');
      
      if(dateEvent === dateOfDay) {
        return event;
      }
      return null;
    });
  
    return eventsOfDay;
  }

  const addOffset = () => {
    if(isDayView) {
      setOffsetDay(val => val + 1);
    } else {
      setOffsetWeek(val => val + 7);
    }
  }

  const minusOffset = () => {
    if(isDayView) {
      setOffsetDay(val => val - 1);
    } else {
      setOffsetWeek(val => val - 7);
    }    
  }

  const resetOffset = () => {
    if(isDayView) {
      setOffsetDay(0);
    } else {
      setOffsetWeek(0);
    }    
  }

  const getEventsOfWeek = (events: VEvent[], offsetWeek: number) => {
    const weekStartDate = moment().startOf('day').add(offsetWeek, 'days').weekday(0);
    const weekEndDate = moment().startOf('day').add(offsetWeek, 'days').weekday(6);

    const eventsOfWeek = events.filter((event) => {
      const dateEvent = moment(event.DTSTART);
      
      if(dateEvent.isBetween(weekStartDate, weekEndDate)) {
        return event;
      }
      
      return null;
    });
  
    return eventsOfWeek;
  }
  
  const renderCoursesByDay = (customCoursesOfDay?: VEvent[]) => {    
    const currentMoment = moment();

    const courses = customCoursesOfDay ? customCoursesOfDay : coursesOfDay;
  
    return courses.map((cours) => {
      const startCourse = moment(cours.DTSTART);
      const endCourse = moment(cours.DTEND);
  
      const isCurrentCourse = currentMoment.isBetween(startCourse, endCourse);
  
      let classNames = `${styles.card}`;
      isCurrentCourse ? classNames += ` ${styles.currentCourse}` : null; 
  
      const durationInMinutes = endCourse.diff(startCourse, 'minutes');
      const duration = moment().startOf('day').add(durationInMinutes, 'minutes').format('HH[H]mm');
  
      return <div key={cours.UID} className={classNames}>
        <p>De {moment(cours.DTSTART).format('HH:mm')} à {moment(cours.DTEND).format('HH:mm')} ({duration})</p>
        <p>{cours.LOCATION}</p>
        <p>{cours.SUMMARY}</p>
      </div>
    })
  }

  const renderCoursesByWeek = (customCoursesOfWeek?: VEvent[]) => {    
    // const eventsOfWeek = getEventsOfWeek(courses, 0);

    const courses = customCoursesOfWeek ? customCoursesOfWeek : coursesOfWeek;


    let eventsOfWeekElements: JSX.Element[] = [];

    for(let i = 0; i <= 5; i++) {
      let offsetDay = moment().add(offsetWeek, 'days').weekday(i);
      const offsetDayNumber = offsetDay.diff(moment(), 'days');

      const eventsOfDay = getEventsOfDay(courses, offsetDayNumber);
      const eventsOfDayElements = renderCoursesByDay(eventsOfDay);

      const dayElement = <div className={styles.day}>
        <div className={styles.dayTitle}>{offsetDay.format("dddd")}</div>
        {eventsOfDayElements}
      </div>
      eventsOfWeekElements.push(dayElement);
    }
    const firstWeekDay = moment().startOf('day').add(offsetWeek, 'days').weekday(0).format("DD/MM/YYYY");

    const weekEvents = <>
      <div style={{width: "100%"}}>
        Semaine du {firstWeekDay} :
        <br />
        <br />
        <div className={styles.eventsOfWeek}>
          {eventsOfWeekElements}
        </div>
      </div>
    </>
  
    return weekEvents;
  }

  const dateOfDay = moment().startOf('day').add(offsetDay, 'days').format('dddd DD/MM/YYYY');

  return (
    <div>
      <div style={{textAlign: 'right'}}>
        <button onClick={() => setIsDayView(day => day ? false : true)}> Vue {isDayView ? "par semaine" : "par jour"}</button>
        <button className={styles.paginButton} onClick={() => minusOffset()}>{"<"}</button>
        <button className={`${styles.paginButton} ${styles.buttonRight}`} onClick={() => addOffset()}> {">"} </button>
      </div>
      <div onClick={() => resetOffset()} >
        <h4>Revenir au jour actuel</h4>
      </div>

      {
        isDayView ? <>
          Les cours du {dateOfDay} :
          <div>
            {renderCoursesByDay()}
          </div>
        </> : <div className={styles.weekCourses}>
            {renderCoursesByWeek()}
          </div>
      }
      </div> 
  );
}