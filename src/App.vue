<template>
  <transition name="asd__fade">
    <div
      :id="wrapperId"
      class="asd__wrapper"
      v-show="showDatepicker"
      :class="wrapperClasses"
      :style="showFullscreen ? undefined : wrapperStyles"
      v-click-outside="handleClickOutside"
    >
      <div class="asd__mobile-header asd__mobile-only" v-if="showFullscreen">
        <button
          type="button"
          class="asd__mobile-close"
          @click="closeDatepicker"
          :aria-label="ariaLabels.closeDatepicker"
        >
          <slot v-if="$slots['close-icon']" name="close-icon"></slot>
          <div v-else class="asd__mobile-close-icon" aria-hidden="true">X</div>
        </button>
        <h3>{{ mobileHeader || mobileHeaderFallback }}</h3>
      </div>

      <div class="asd__datepicker-header">
        <div
          class="asd__change-month-button asd__change-month-button--previous"
        >
          <button
            @click="previousMonth"
            type="button"
            :aria-label="ariaLabels.previousMonth"
          >
            <slot
              v-if="$slots['previous-month-icon']"
              name="previous-month-icon"
            ></slot>
            <svg v-else viewBox="0 0 1000 1000">
              <path
                d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"
              ></path>
            </svg>
          </button>
        </div>

        <div class="asd__change-month-button asd__change-month-button--next">
          <button
            @click="nextMonth"
            type="button"
            :aria-label="ariaLabels.nextMonth"
          >
            <slot
              v-if="$slots['next-month-icon']"
              name="next-month-icon"
            ></slot>
            <svg v-else viewBox="0 0 1000 1000">
              <path
                d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"
              ></path>
            </svg>
          </button>
        </div>

        <div
          class="asd__days-legend"
          v-for="(month, index) in showMonths"
          :key="month"
          :style="[monthWidthStyles, { left: width * index + 'px' }]"
        >
          <div
            class="asd__day-title"
            v-for="(day, index) in daysShort"
            :key="index"
          >
            {{ day }}
          </div>
        </div>
      </div>

      <div class="asd__inner-wrapper" :style="innerStyles">
        <transition-group name="asd__list-complete" tag="div">
          <div
            v-for="(month, monthIndex) in months"
            :key="month.firstDateOfMonth"
            class="asd__month"
            :class="{
              'asd__month--hidden': monthIndex === 0 || monthIndex > showMonths
            }"
            :style="monthWidthStyles"
          >
            <div class="asd__month-name">
              <select
                v-if="showMonthYearSelect"
                v-model="month.monthName"
                class="asd__month-year-select"
                :tabindex="monthIndex === 0 || monthIndex > showMonths ? -1 : 0"
                @change="updateMonth(monthIndex, month.year, $event)"
                v-resize-select
              >
                <option
                  v-for="(monthName, idx) in monthNames"
                  :value="monthName"
                  :disabled="isMonthDisabled(month.year, idx)"
                  :key="`month-${monthIndex}-${monthName}`"
                  >{{ monthName }}
                </option>
              </select>
              <span v-else>{{ month.monthName }}</span>

              <select
                v-if="showMonthYearSelect"
                class="asd__month-year-select"
                :tabindex="monthIndex === 0 || monthIndex > showMonths ? -1 : 0"
                v-model="month.year"
                @change="updateYear(monthIndex, month.monthNumber - 1, $event)"
              >
                <option
                  v-if="years.indexOf(month.year) === -1"
                  :value="month.year"
                  :key="`month-${monthIndex}-${year}`"
                  :disabled="true"
                  >{{ month.year }}
                </option>
                <option
                  v-for="year in years"
                  :value="year"
                  :key="`month-${monthIndex}-${year}`"
                  >{{ year }}
                </option>
              </select>
              <span v-else>{{ month.year }}</span>
            </div>

            <table class="asd__month-table" role="presentation">
              <tbody>
                <tr
                  class="asd__week"
                  v-for="(week, index) in month.weeks"
                  :key="index"
                >
                  <td
                    class="asd__day"
                    v-for="({ fullDate, dayNumber }, index) in week"
                    :key="index + '_' + dayNumber"
                    :data-date="fullDate"
                    :ref="`date-${fullDate}`"
                    :tabindex="
                      isDateVisible(fullDate) &&
                      isSameDate(focusedDate, fullDate)
                        ? 0
                        : -1
                    "
                    :aria-label="
                      isDateVisible(fullDate)
                        ? getAriaLabelForDate(fullDate)
                        : false
                    "
                    :class="[
                      {
                        'asd__day--enabled': dayNumber !== 0,
                        'asd__day--empty': dayNumber === 0,
                        'asd__day--disabled': isDisabled(fullDate),
                        'asd__day--selected':
                          fullDate &&
                          (selectedDate1 === fullDate ||
                            selectedDate2 === fullDate),
                        'asd__day--in-range': isInRange(fullDate),
                        'asd__day--today': fullDate && isToday(fullDate),
                        'asd__day--hovered': isHoveredInRange(fullDate),
                        'asd__selected-date-one':
                          fullDate && fullDate === selectedDate1,
                        'asd__selected-date-two':
                          fullDate && fullDate === selectedDate2
                      },
                      customizedDateClass(fullDate)
                    ]"
                    :style="getDayStyles(fullDate)"
                    @mouseover="
                      () => {
                        setHoverDate(fullDate);
                      }
                    "
                  >
                    <button
                      class="asd__day-button"
                      type="button"
                      v-if="dayNumber"
                      tabindex="-1"
                      :date="fullDate"
                      :disabled="isDisabled(fullDate)"
                      @click="
                        () => {
                          selectDate(fullDate);
                        }
                      "
                    >
                      {{ dayNumber }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition-group>

        <div
          v-if="showShortcutsMenuTrigger"
          :class="{
            'asd__keyboard-shortcuts-menu': true,
            'asd__keyboard-shortcuts-show': showKeyboardShortcutsMenu
          }"
          :style="keyboardShortcutsMenuStyles"
        >
          <div class="asd__keyboard-shortcuts-title">
            {{ texts.keyboardShortcuts }}
          </div>
          <button
            class="asd__keyboard-shortcuts-close"
            ref="keyboard-shortcus-menu-close"
            tabindex="0"
            @click="closeKeyboardShortcutsMenu"
            :aria-label="ariaLabels.closeKeyboardShortcutsMenu"
          >
            <slot
              v-if="$slots['close-shortcuts-icon']"
              name="close-shortcuts-icon"
            ></slot>
            <div v-else class="asd__mobile-close-icon" aria-hidden="true">
              X
            </div>
          </button>
          <ul class="asd__keyboard-shortcuts-list">
            <li v-for="(shortcut, i) in keyboardShortcuts" :key="i">
              <span
                class="asd__keyboard-shortcuts-symbol"
                :aria-label="shortcut.symbolDescription"
                >{{ shortcut.symbol }}</span
              >
              {{ shortcut.label }}
            </li>
          </ul>
        </div>
      </div>

      <div
        class="asd__action-buttons"
        v-if="mode !== 'single' && showActionButtons"
      >
        <button @click="closeDatepickerCancel" type="button">
          {{ texts.cancel }}
        </button>
        <button
          ref="apply-button"
          @click="apply"
          :style="{ color: colors.selected }"
          type="button"
        >
          {{ texts.apply }}
        </button>
      </div>

      <div
        v-if="showShortcutsMenuTrigger"
        class="asd__keyboard-shortcuts-trigger-wrapper"
      >
        <button
          class="asd__keyboard-shortcuts-trigger"
          :aria-label="ariaLabels.openKeyboardShortcutsMenu"
          tabindex="0"
          @click="openKeyboardShortcutsMenu"
        >
          <span>?</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
// interfaces
import {
  AriaLabelsInterface,
  ColoursInterface,
  KeyboardShortcutInterface,
  TextsInterface
} from '@/inrefaces';

// vue
import { defineComponent, ref } from 'vue';

// helpers
import { debounce, copyObject, findAncestor, randomString } from '@/helpers';
// import { ResizeSelect } from '@/directives'

// constants
import {
  monthNames,
  ariaLabels,
  colors,
  days,
  daysShort,
  texts,
  keyboardShortcuts,
  keys
} from './constants';

// libraries
// import vClickOutside from 'v-click-outside';

import {
  format,
  subMonths,
  addMonths,
  getDaysInMonth,
  lastDayOfMonth,
  getMonth,
  setMonth,
  getYear,
  setYear,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  isValid
} from 'date-fns';
import { KeysInterface } from '@/inrefaces/Keys.interface';

export default defineComponent({
  name: 'App',
  // directives: {
  // clickOutside: vClickOutside.directive
  // resizeSelect: ResizeSelect,
  // },
  emits: [],
  props: {
    triggerElementId: {
      type: String
    },
    dateOne: {
      type: [String, Date]
    },
    dateTwo: {
      type: [String, Date]
    },
    minDate: {
      type: [String, Date]
    },
    endDate: {
      type: [String, Date]
    },
    mode: {
      type: String,
      default: 'range'
    },
    offsetY: {
      type: Number,
      default: 0
    },
    offsetX: {
      type: Number,
      default: 0
    },
    monthsToShow: {
      type: Number,
      default: 2
    },
    startOpen: {
      type: Boolean
    },
    fullscreenMobile: {
      type: Boolean
    },
    inline: {
      type: Boolean
    },
    mobileHeader: {
      type: String
    },
    disabledDates: {
      type: Array,
      default: () => []
    },
    enabledDates: {
      type: Array,
      default: () => []
    },
    customizedDates: {
      type: Array,
      default: () => []
    },
    showActionButtons: {
      type: Boolean,
      default: true
    },
    showShortcutsMenuTrigger: {
      type: Boolean,
      default: true
    },
    showMonthYearSelect: {
      type: Boolean,
      default: false
    },
    yearsForSelect: {
      type: Number,
      default: 10
    },
    isTest: {
      type: Boolean,
      default: () => process.env.NODE_ENV === 'test'
    },
    trigger: {
      type: Boolean,
      default: false
    },
    closeAfterSelect: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const wrapperId = ref<string>(
      'airbnb-style-datepicker-wrapper-' + randomString(5)
    );
    const dateFormat = ref<string>('YYYY-MM-DD');
    const dateLabelFormat = ref<string>('dddd, MMMM D, YYYY');
    const showDatepicker = ref<boolean>(false);
    const showKeyboardShortcutsMenu = ref<boolean>(false);
    const showMonths = ref<number>(2);
    const sundayFirst = ref<boolean>(false);

    const colors = ref<ColoursInterface>(colors);
    const ariaLabels = ref<AriaLabelsInterface>(ariaLabels);
    const monthNames = ref<string[]>(monthNames);
    const days = ref<string[]>(days);
    const daysShort = ref<string[]>(daysShort);
    const texts = ref<TextsInterface>(texts);
    const keyboardShortcuts = ref<KeyboardShortcutInterface>(keyboardShortcuts);
    const keys = ref<KeysInterface>(keys);

    return {
      // reactive data
      wrapperId
      // computed property
      // methods
    };
  }
});
</script>

<style lang="scss">
@import './styles/transitions';

$tablet: 768px;
$color-gray: rgba(0, 0, 0, 0.2);
$border-normal: 1px solid $color-gray;
$border: 1px solid #e4e7e7;
$transition-time: 0.3s;

.datepicker-trigger {
  position: relative;
  overflow: visible;
}

.asd {
  &__wrapper {
    border: $border-normal;
    white-space: nowrap;
    text-align: center;
    overflow: hidden;
    background-color: white;

    *,
    *:after,
    *:before {
      box-sizing: border-box;
    }

    &--full-screen {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border: none;
      z-index: 100;
    }
  }

  &__inner-wrapper {
    transition: all $transition-time ease;
    position: relative;
  }

  &__datepicker-header {
    position: relative;
  }

  &__keyboard-shortcuts-trigger-wrapper {
    position: relative;
  }

  &__keyboard-shortcuts-trigger {
    background-color: transparent;
    cursor: pointer;
    position: absolute;
    bottom: 0;
    right: 0;
    font: inherit;
    border-width: 26px 33px 0 0;
    border-top: 26px solid transparent;
    border-right: 33px solid rgb(0, 166, 153);

    span {
      color: rgb(255, 255, 255);
      position: absolute;
      bottom: 0;
      right: -28px;
    }
  }

  &__keyboard-shortcuts-show {
    display: block !important;
  }

  &__keyboard-shortcuts-close {
    background-color: transparent;
    border: none;
    position: absolute;
    top: 7px;
    right: 5px;
    padding: 5px;
    z-index: 100;
    cursor: pointer;
  }

  &__keyboard-shortcuts-menu {
    display: none;
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 10;
    overflow: auto;
    background: rgb(255, 255, 255);
    border-width: 1px;
    border-style: solid;
    border-color: rgb(219, 219, 219);
    border-image: initial;
    border-radius: 2px;
    padding: 22px;
    margin: 33px;
    text-align: left;
  }

  &__keyboard-shortcuts-title {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
  }

  &__keyboard-shortcuts-list {
    list-style: none;
    margin: 6px 0;
    padding: 0;
    white-space: initial;
  }

  &__keyboard-shortcuts-symbol {
    font-family: monospace;
    font-size: 12px;
    text-transform: uppercase;
    background: rgb(242, 242, 242);
    padding: 2px 6px;
    margin-right: 4px;
  }

  &__change-month-button {
    position: absolute;
    top: 12px;
    z-index: 10;
    background: white;

    &--previous {
      left: 0;
      padding-left: 15px;
    }

    &--next {
      right: 0;
      padding-right: 15px;
    }

    > button {
      background-color: white;
      border: $border;
      border-radius: 3px;
      padding: 4px 8px;
      cursor: pointer;

      &:hover {
        border: 1px solid #c4c4c4;
      }

      > svg {
        height: 19px;
        width: 19px;
        fill: #82888a;
      }
    }
  }

  &__days-legend {
    position: absolute;
    top: 50px;
    left: 10px;
    padding: 0 10px;
  }

  &__day-title {
    display: inline-block;
    width: percentage(1/7);
    text-align: center;
    margin-bottom: 4px;
    color: rgba(0, 0, 0, 0.7);
    font-size: 0.8em;
    margin-left: -1px;
  }

  &__month-table {
    border-collapse: collapse;
    border-spacing: 0;
    background: white;
    width: 100%;
    max-width: 100%;
  }

  &__month {
    transition: all $transition-time ease;
    display: inline-block;
    padding: 15px;

    &--hidden {
      height: 275px;
      visibility: hidden;
    }
  }

  &__month-name {
    font-size: 1.3em;
    text-align: center;
    margin: 0 0 30px;
    line-height: 1.4em;
    font-weight: bold;
  }

  &__month-year-select {
    &::-ms-expand {
      display: none;
    }

    -webkit-appearance: none;
    border: none;
    background-color: inherit;
    cursor: pointer;
    color: blue;
    font-size: inherit;
    font-weight: inherit;
    padding: 0;
  }

  &__day {
    $size: 38px;
    line-height: $size;
    height: $size;
    padding: 0;
    overflow: hidden;

    &--enabled {
      border: $border;

      &:hover {
        background-color: #e4e7e7;
      }

      &:focus {
        outline: auto 5px Highlight;
        outline: auto 5px -webkit-focus-ring-color;
      }
    }

    &--disabled,
    &--empty {
      opacity: 0.5;

      button {
        cursor: default;
      }
    }

    &--empty {
      border: none;
    }

    &--disabled {
      &:hover {
        background-color: transparent;
      }
    }
  }

  &__day-button {
    background: transparent;
    width: 100%;
    height: 100%;
    border: none;
    cursor: pointer;
    color: inherit;
    text-align: center;
    user-select: none;
    font-size: 15px;
    font-weight: inherit;
    padding: 0;
  }

  &__action-buttons {
    min-height: 50px;
    padding-top: 10px;
    margin-bottom: 12px;

    button {
      display: block;
      position: relative;
      background: transparent;
      border: none;
      font-weight: bold;
      font-size: 15px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }

      &:nth-child(1) {
        float: left;
        left: 15px;
      }

      &:nth-child(2) {
        float: right;
        right: 15px;
      }
    }
  }

  &__mobile-header {
    border-bottom: $border-normal;
    position: relative;
    padding: 15px 15px 15px 15px !important;
    text-align: center;
    height: 50px;

    h3 {
      font-size: 20px;
      margin: 0;
    }
  }

  &__mobile-only {
    display: none;
    @media (max-width: 600px) {
      display: block;
    }
  }

  &__mobile-close {
    border: none;
    position: absolute;
    top: 7px;
    right: 5px;
    padding: 5px;
    z-index: 100;
    cursor: pointer;

    &__icon {
      position: relative;
      font-size: 1.6em;
      font-weight: bold;
      padding: 0;
    }
  }
}
</style>
