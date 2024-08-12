import * as moment from 'moment-timezone';

export const getStartOfDay = (timeZone: string, date: Date = new Date()) => {
  const currentDate = moment.tz(date, timeZone);
  currentDate.hours(0);
  currentDate.minutes(0);
  return moment.tz(currentDate, 'UTC').toDate();
};

export const getEndOfDay = (timeZone: string, date: Date = new Date()) => {
  const endTime = moment.tz(date, timeZone);
  endTime.hours(23);
  endTime.minutes(59);
  endTime.seconds(59);

  return moment.tz(endTime, 'UTC').toDate();
};

export const getWeeklyDurationDates = (timeZone: string) => {
  const currentDate = moment.tz(new Date(), timeZone).toDate();
  currentDate.setHours(0);
  currentDate.setMinutes(0);
  const currentWeekDay = currentDate.getDay();
  const lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
  const weekStart = new Date(new Date(currentDate).setDate(currentDate.getDate() - lessDays));
  const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

  return {
    startDate: getStartOfDay(timeZone, weekStart),
    endDate: getEndOfDay(timeZone, weekEnd),
  };
};
