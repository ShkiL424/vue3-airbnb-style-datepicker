export interface MonthsInterface {
  firstDateOfMonth: string;
  monthName: string;
  monthNumber: number;
  weeks: Array<Array<{ dayNumber: number }>>;
  year: string;
}
