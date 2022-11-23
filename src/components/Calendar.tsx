import { useEffect, useState } from "react";
import moment from "moment";
import styles from "./Calendar.module.css";
import "moment/locale/fr";
import { VEvent } from "./Home";
import { getSubjectId } from "../helpers/CoursesHelpers";
moment().locale("fr");

type CalendarProps = {
  url: string;
  eventsIcs: VEvent[];
  subjectColors: Map<string, string>;
};

export default function Calendar({ url, eventsIcs, subjectColors }: CalendarProps) {
  const [courses, setCourses] = useState<VEvent[]>([]);
  const [coursesOfDay, setCoursesOfDay] = useState<VEvent[]>([]);
  const [coursesOfWeek, setCoursesOfWeek] = useState<VEvent[]>([]);
  const [offsetDay, setOffsetDay] = useState(0);
  const [offsetWeek, setOffsetWeek] = useState(0);
  const [isDayView, setIsDayView] = useState(true);

  useEffect(() => {
    const viewMode = getViewModeInLocalStorage();
    if (viewMode) {
      viewMode === "day" ? setIsDayView(true) : setIsDayView(false);
    }

    setCourses(eventsIcs);
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
    const viewMode = isDayView ? "day" : "week";
    saveViewModeInLocalStorage(viewMode);
  }, [isDayView]);

  const renderCoursesByDay = (customCoursesOfDay?: VEvent[]) => {
    const currentMoment = moment();

    const courses = customCoursesOfDay ? customCoursesOfDay : coursesOfDay;
    const dateOfDay = moment().startOf("day").add(offsetDay, "days").format("dddd DD/MM/YYYY");

    const eventsOfDayElements = courses.map((cours) => {
      const startCourse = moment(cours.DTSTART);
      const endCourse = moment(cours.DTEND);

      const isCurrentCourse = currentMoment.isBetween(startCourse, endCourse);
      const classNames = `${styles.card} ${isCurrentCourse && styles.currentCourse}`;

      const durationInMinutes = endCourse.diff(startCourse, "minutes");
      const duration = moment().startOf("day").add(durationInMinutes, "minutes").format("HH[H]mm");

      return (
        <div
          key={cours.UID}
          className={classNames}
          style={{ backgroundColor: subjectColors.get(getSubjectId(cours.SUMMARY)) }}
        >
          <p className={styles.informationCard}>
            De {moment(cours.DTSTART).format("HH:mm")} à {moment(cours.DTEND).format("HH:mm")} ({duration})
          </p>
          <p className={styles.informationCard}>{cours.LOCATION}</p>
          <p className={styles.informationCard}>{cours.SUMMARY}</p>
        </div>
      );
    });

    if (eventsOfDayElements.length > 0) {
      const dayEvents = (
        <>
          <div>
            {!customCoursesOfDay && (
              <>
                Les cours du {dateOfDay} : <br />
                <br />
              </>
            )}

            {eventsOfDayElements}
          </div>
        </>
      );
      return dayEvents;
    } else if (!customCoursesOfDay) {
      return <p>Aucun cours le {dateOfDay}</p>;
    }

    return null;
  };

  const renderDay = (weekDay: number, courses: VEvent[]) => {
    let offsetDay = moment().add(offsetWeek, "days").weekday(weekDay);
    const offsetDayNumber = offsetDay.diff(moment(), "days");

    const eventsOfDay = getEventsOfDay(courses, offsetDayNumber);

    if (weekDay >= 5 && eventsOfDay.length === 0) {
      return null;
    }

    const eventsOfDayElements = renderCoursesByDay(eventsOfDay);

    const dayElement = (
      <div className={styles.day}>
        <div className={styles.dayTitle}>{offsetDay.format("dddd DD/MM")}</div>
        {eventsOfDayElements}
      </div>
    );

    return dayElement;
  };

  const renderCoursesByWeek = (customCoursesOfWeek?: VEvent[]) => {
    const courses = customCoursesOfWeek ? customCoursesOfWeek : coursesOfWeek;
    const eventsOfWeekElements: JSX.Element[] = [];

    for (let weekDay = 0; weekDay < 7; weekDay++) {
      const dayElement = renderDay(weekDay, courses);
      if (dayElement) eventsOfWeekElements.push(dayElement);
    }

    const firstWeekDay = moment().startOf("day").add(offsetWeek, "days").weekday(0).format("DD/MM/YYYY");

    if (eventsOfWeekElements.length > 0) {
      const weekEvents = (
        <>
          <div style={{ width: "100%" }}>
            Semaine du {firstWeekDay} :
            <br />
            <br />
            <div className={styles.eventsOfWeek}>{eventsOfWeekElements}</div>
          </div>
        </>
      );

      return weekEvents;
    }

    return null;
  };

  const getEventsOfDay = (events: VEvent[], offsetDay: number) => {
    const dateOfDay = moment().startOf("day").add(offsetDay, "days").format("LL");

    const eventsOfDay = events.filter((event) => {
      const dateEvent = moment(event.DTSTART).format("LL");

      if (dateEvent === dateOfDay) {
        return event;
      }
      return null;
    });

    return eventsOfDay;
  };

  const getEventsOfWeek = (events: VEvent[], offsetWeek: number) => {
    const weekStartDate = moment().startOf("day").add(offsetWeek, "days").weekday(0);
    const weekEndDate = moment().startOf("day").add(offsetWeek, "days").weekday(6);

    const eventsOfWeek = events.filter((event) => {
      const dateEvent = moment(event.DTSTART);

      if (dateEvent.isBetween(weekStartDate, weekEndDate)) {
        return event;
      }

      return null;
    });

    return eventsOfWeek;
  };

  const saveViewModeInLocalStorage = (viewMode: string) => {
    localStorage.setItem("viewMode", viewMode);
  };

  const getViewModeInLocalStorage = () => {
    const viewMode = localStorage.getItem("viewMode");
    if (viewMode) {
      return viewMode;
    }

    return null;
  };

  const addOffset = () => {
    if (isDayView) {
      setOffsetDay((val) => val + 1);
    } else {
      setOffsetWeek((val) => val + 7);
    }
  };

  const minusOffset = () => {
    if (isDayView) {
      setOffsetDay((val) => val - 1);
    } else {
      setOffsetWeek((val) => val - 7);
    }
  };

  const resetOffset = () => {
    if (isDayView) {
      setOffsetDay(0);
    } else {
      setOffsetWeek(0);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "right" }}>
        <button onClick={() => setIsDayView((day) => (day ? false : true))}>
          {" "}
          Vue {isDayView ? "par semaine" : "par jour"}
        </button>
        <button className={styles.paginButton} onClick={() => minusOffset()}>
          {"<"}
        </button>
        <button className={`${styles.paginButton} ${styles.buttonRight}`} onClick={() => addOffset()}>
          {" "}
          {">"}{" "}
        </button>
      </div>
      <div onClick={() => resetOffset()}>
        <h4>Revenir au jour actuel</h4>
      </div>

      {isDayView ? (
        <>
          <div>{renderCoursesByDay()}</div>
        </>
      ) : (
        <div className={styles.weekCourses}>{renderCoursesByWeek()}</div>
      )}
    </div>
  );
}
