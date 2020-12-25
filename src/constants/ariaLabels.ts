// interfaces
import { AriaLabelsInterface } from '@/inrefaces';

export const ariaLabels: AriaLabelsInterface = {
  chooseDate: date => date,
  chooseStartDate: date => `Choose ${date} as your start date.`,
  chooseEndDate: date => `Choose ${date} as your end date.`,
  selectedDate: date => `Selected. ${date}`,
  unavailableDate: date => `Not available. ${date}`,
  previousMonth: 'Move backward to switch to the previous month.',
  nextMonth: 'Move forward to switch to the next month.',
  closeDatepicker: 'Close calendar',
  openKeyboardShortcutsMenu: 'Open keyboard shortcuts menu.',
  closeKeyboardShortcutsMenu: 'Close keyboard shortcuts menu'
};
