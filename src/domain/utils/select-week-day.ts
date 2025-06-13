import { WeekDays } from '@/core/types/weekDays';

export function selectWeekDay(day: string): WeekDays {
  let weekDay: WeekDays;
  if (day === 'monday') {
    weekDay = WeekDays.MONDAY;
  } else if (day === 'tuesday') {
    weekDay = WeekDays.TUESDAY;
  } else if (day === 'wednesday') {
    weekDay = WeekDays.WEDNESDAY;
  } else if (day === 'thursday') {
    weekDay = WeekDays.THURSDAY;
  } else if (day === 'friday') {
    weekDay = WeekDays.FRIDAY;
  } else if (day === 'saturday') {
    weekDay = WeekDays.SATURDAY;
  } else if (day === 'sunday') {
    weekDay = WeekDays.SUNDAY;
  } else {
    weekDay = WeekDays.MONDAY;
  }

  return weekDay;
}
