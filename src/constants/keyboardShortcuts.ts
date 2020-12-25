// interface
import { KeyboardShortcutInterface } from '@/inrefaces';

export const keyboardShortcuts: KeyboardShortcutInterface[] = [
  {
    symbol: '↵',
    label: 'Select the date in focus',
    symbolDescription: 'Enter key'
  },
  {
    symbol: '←/→',
    label: 'Move backward (left) and forward (right) by one day.',
    symbolDescription: 'Left or right arrow keys'
  },
  {
    symbol: '↑/↓',
    label: 'Move backward (up) and forward (down) by one week.',
    symbolDescription: 'Up or down arrow keys'
  },
  {
    symbol: 'PgUp/PgDn',
    label: 'Switch months.',
    symbolDescription: 'PageUp and PageDown keys'
  },
  {
    symbol: 'Home/End',
    label: 'Go to the first or last day of a week.',
    symbolDescription: 'Home or End keys'
  },
  {
    symbol: 'Esc',
    label: 'Close this panel',
    symbolDescription: 'Escape key'
  },
  {
    symbol: '?',
    label: 'Open this panel',
    symbolDescription: 'Question mark'
  }
];
