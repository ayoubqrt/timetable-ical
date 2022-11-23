import { VEvent } from "../components/Home";

export const getAllSubjectColors = (courses: VEvent[]) => {
  const subjects = courses.map((course) => getSubjectId(course.SUMMARY));
  const subjectsWithoutDuplicates = [...new Set(subjects)];
  const mapSubjectsWithColors = new Map<string, string>();

  subjectsWithoutDuplicates.forEach((subject) => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    if (!mapSubjectsWithColors.has(subject)) {
      mapSubjectsWithColors.set(subject, `#${randomColor}`);
    }
  });

  return mapSubjectsWithColors;
};

export const getSubjectId = (subject: string) => {
  return subject.split(" ")[0];
};
