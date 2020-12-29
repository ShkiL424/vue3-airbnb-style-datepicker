<template>
  <transition name="asd__fade">
    <div
      class="asd__wrapper"
      v-show="showDatepicker"
      ref="wrapperRef"
      :id="wrapperId"
      :class="wrapperClasses"
      :style="showFullscreen ? undefined : wrapperStyles"
    >
      <div class="asd__mobile-header asd__mobile-only" v-if="showFullscreen">
        <button
          type="button"
          class="asd__mobile-close"
          @click="closeDatepicker"
          :aria-label="ariaLabels.closeDatepicker"
        >
          <slot v-if="$slots['close-icon']" name="close-icon"></slot>
          <span v-else class="asd__mobile-close-icon" aria-hidden="true">X</span>
        </button>
        <h3>{{ mobileHeader || mobileHeaderFallback }}</h3>
      </div>

      <div class="asd__datepicker-header">
        <div class="asd__change-month-button asd__change-month-button--previous">
          <button @click="previousMonth" type="button" :aria-label="ariaLabels.previousMonth">
            <slot v-if="$slots['previous-month-icon']" name="previous-month-icon"></slot>
            <svg v-else viewBox="0 0 1000 1000">
              <path
                d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"
              ></path>
            </svg>
          </button>
        </div>

        <div class="asd__change-month-button asd__change-month-button--next">
          <button @click="nextMonth" type="button" :aria-label="ariaLabels.nextMonth">
            <slot v-if="$slots['next-month-icon']" name="next-month-icon"></slot>
            <svg v-else viewBox="0 0 1000 1000">
              <path
                d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"
              ></path>
            </svg>
          </button>
        </div>

        <div
          v-for="(month, index) in showMonths"
          class="asd__days-legend"
          :key="month"
          :style="[monthWidthStyles, { left: width * index + 'px' }]"
        >
          <div class="asd__day-title" v-for="(day, index) in daysShort" :key="index">
            {{ day }}
          </div>
        </div>
      </div>

      <div class="asd__inner-wrapper" :style="innerStyles">
        <transition-group name="asd__list-complete" tag="div">
          <div
            v-for="(month, monthIndex) in months"
            class="asd__month"
            :key="month.firstDateOfMonth"
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
                v-model="month.year"
                class="asd__month-year-select"
                :tabindex="monthIndex === 0 || monthIndex > showMonths ? -1 : 0"
                @change="updateYear(monthIndex, month.monthNumber - 1, $event)"
              >
                <option
                  v-if="years.indexOf(month.year) === -1"
                  :value="month.year"
                  :key="`month-${monthIndex}-${year}`"
                  :disabled="true"
                  >{{ month.year }}
                </option>

                <option v-for="year in years" :value="year" :key="`month-${monthIndex}-${year}`">{{ year }} </option>
              </select>
              <span v-else>{{ month.year }}</span>
            </div>

            <table class="asd__month-table" role="presentation">
              <tbody>
                <tr class="asd__week" v-for="(week, index) in month.weeks" :key="index">
                  <td
                    class="asd__day"
                    v-for="({ fullDate, dayNumber }, index) in week"
                    :key="index + '_' + dayNumber"
                    :data-date="fullDate"
                    :tabindex="isDateVisible(fullDate) && isSameDate(focusedDate, fullDate) ? 0 : -1"
                    :aria-label="isDateVisible(fullDate) ? getAriaLabelForDate(fullDate) : false"
                    :style="getDayStyles(fullDate)"
                    :ref="
                      fullDate => {
                        if (fullDate) fullDatesRef[index] = fullDate;
                      }
                    "
                    :class="[
                      {
                        'asd__day--enabled': dayNumber !== 0,
                        'asd__day--empty': dayNumber === 0,
                        'asd__day--disabled': isDisabled(fullDate),
                        'asd__day--selected': fullDate && (selectedDate1 === fullDate || selectedDate2 === fullDate),
                        'asd__day--in-range': isInRange(fullDate),
                        'asd__day--today': fullDate && isToday(fullDate),
                        'asd__day--hovered': isHoveredInRange(fullDate),
                        'asd__selected-date-one': fullDate && fullDate === selectedDate1,
                        'asd__selected-date-two': fullDate && fullDate === selectedDate2
                      },
                      customizedDateClass(fullDate)
                    ]"
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
            tabindex="0"
            ref="keyboardShortcutsMenuClosRef"
            :aria-label="ariaLabels.closeKeyboardShortcutsMenu"
            @click="closeKeyboardShortcutsMenu"
          >
            <slot v-if="$slots['close-shortcuts-icon']" name="close-shortcuts-icon"></slot>
            <span v-else class="asd__mobile-close-icon" aria-hidden="true">
              X
            </span>
          </button>

          <ul class="asd__keyboard-shortcuts-list">
            <li v-for="(shortcut, i) in keyboardShortcuts" :key="i">
              <span class="asd__keyboard-shortcuts-symbol" :aria-label="shortcut.symbolDescription">{{
                shortcut.symbol
              }}</span>
              {{ shortcut.label }}
            </li>
          </ul>
        </div>
      </div>

      <div class="asd__action-buttons" v-if="mode !== 'single' && showActionButtons">
        <button @click="closeDatepickerCancel" type="button">
          {{ texts.cancel }}
        </button>

        <button type="button" ref="applyButtonRef" :style="{ color: colors.selected }" @click="apply">
          {{ texts.apply }}
        </button>
      </div>

      <div v-if="showShortcutsMenuTrigger" class="asd__keyboard-shortcuts-trigger-wrapper">
        <button
          class="asd__keyboard-shortcuts-trigger"
          tabindex="0"
          :aria-label="ariaLabels.openKeyboardShortcutsMenu"
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
  CustomizedDatesInterface,
  KeyboardShortcutInterface,
  MonthsInterface,
  TextsInterface
} from '@/inrefaces';
import { KeysInterface } from '@/inrefaces/Keys.interface';

// vue
import { defineComponent, ref, computed, nextTick, watch, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';

// helpers
import { copyObject, findAncestor, randomString } from '@/helpers';

// constants
import {
  ariaLabelsConfig,
  monthNamesConfig,
  colorsConfig,
  daysConfig,
  daysShortConfig,
  textsConfig,
  keyboardShortcutsConfig,
  keysConfig
} from '@/constants';

// libraries
import { onClickOutside, useDebounceFn } from '@vueuse/core';
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

export default defineComponent({
  name: 'App',
  emits: [
    'previous-month',
    'next-month',
    'opened',
    'cancelled',
    'closed',
    'apply',
    'date-one-selected',
    'date-two-selected'
  ],
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
      type: Array as () => Array<CustomizedDatesInterface>,
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
    const applyButtonRef = ref(null);
    const wrapperRef = ref(null);
    const keyboardShortcutsMenuClosRef = ref(null);
    const fullDatesRef = ref([]);

    const wrapperId = ref<string>('airbnb-style-datepicker-wrapper-' + randomString(5));
    const dateFormat = ref<string>('YYYY-MM-DD');
    const dateLabelFormat = ref<string>('dddd, MMMM D, YYYY');
    const selectedDate1 = ref<string>('');
    const selectedDate2 = ref<string>('');
    const startingDate = ref<string | Date>('');
    const hoverDate = ref<string>('');
    const focusedDate = ref<string | Date>('');

    const showKeyboardShortcutsMenu = ref<boolean>(false);
    const isSelectingDate1 = ref<boolean>(true);
    const showDatepicker = ref<boolean>(false);
    const sundayFirst = ref<boolean>(false);
    const alignRight = ref<boolean>(false);

    const months = ref<MonthsInterface[]>([]);
    const years = ref<string[]>([]);

    const showMonths = ref<number>(2);
    const width = ref<number>(300);

    const triggerPosition = ref<{
      height?: number;
      right?: any;
      left?: any;
    }>({});
    const triggerWrapperPosition = ref<{
      left?: number;
      right?: number;
    }>({});

    const viewportWidth = ref(undefined);
    const isMobile = ref(undefined);
    const isTablet = ref(undefined);
    const triggerElement = ref(undefined);

    const ariaLabels = ref<AriaLabelsInterface>(ariaLabelsConfig);
    const colors = ref<ColoursInterface>(colorsConfig);
    const monthNames = ref<string[]>(monthNamesConfig);
    const days = ref<string[]>(daysConfig);
    const daysShort = ref<string[]>(daysShortConfig);
    const texts = ref<TextsInterface>(textsConfig);
    const keyboardShortcuts = ref<KeyboardShortcutInterface[]>(keyboardShortcutsConfig);
    const keys = ref<KeysInterface>(keysConfig);

    const showFullscreen = computed(() => isMobile.value && props.fullscreenMobile);
    const wrapperClasses = computed(() => ({
      'asd__wrapper--datepicker-open': showDatepicker.value,
      'asd__wrapper--full-screen': showFullscreen.value,
      'asd__wrapper--inline': props.inline
    }));
    const wrapperStyles = computed(() => ({
      position: props.inline ? 'static' : 'absolute',
      top: props.inline ? '0' : triggerPosition.value.height + props.offsetY + 'px',
      left: !alignRight.value
        ? triggerPosition.value.left - triggerWrapperPosition.value.left + props.offsetX + 'px'
        : '',
      right: alignRight.value
        ? triggerWrapperPosition.value.right - triggerPosition.value.right + props.offsetX + 'px'
        : '',
      width: width.value * showMonths.value + 'px',
      zIndex: props.inline ? '0' : '100'
    }));
    const innerStyles = computed(() => ({
      'margin-left': showFullscreen.value ? '-' + viewportWidth.value : `-${width.value}px`
    }));
    const keyboardShortcutsMenuStyles = computed(() => ({
      left: showFullscreen.value ? viewportWidth.value : `${width.value}px`
    }));
    const monthWidthStyles = computed(() => ({
      width: showFullscreen.value ? viewportWidth.value : width.value + 'px'
    }));
    const mobileHeaderFallback = computed(() => (props.mode === 'range' ? 'Select dates' : 'Select date'));
    const datesSelected = computed(() =>
      Boolean(
        (selectedDate1.value && selectedDate1.value !== '') || (selectedDate2.value && selectedDate2.value !== '')
      )
    );
    const allDatesSelected = computed(() =>
      Boolean(selectedDate1.value && selectedDate1.value !== '' && selectedDate2.value && selectedDate2.value !== '')
    );
    const hasMinDate = computed(() => Boolean(props.minDate && props.minDate !== ''));
    const isRangeMode = computed(() => props.mode === 'range');
    const isSingleMode = computed(() => props.mode === 'single');
    const datepickerWidth = computed(() => width.value * showMonths.value);
    const datePropsCompound = computed(() => props.dateOne + props.dateTwo);
    const isDateTwoBeforeDateOne = computed(() => {
      if (!props.dateTwo) {
        return false;
      }
      return isBefore(props.dateTwo, props.dateOne);
    });
    const visibleMonths = computed(() => {
      const firstMonthArray: any = months.value.filter((m, index) => index > 0);
      const numberOfMonthsArray = [];
      for (let i = 0; i < showMonths.value; i++) {
        numberOfMonthsArray.push(i);
      }
      return numberOfMonthsArray.map((_, index) => firstMonthArray[index].firstDateOfMonth);
    });

    function isSelected(date: boolean | string) {
      if (!date) {
        return;
      }
      return selectedDate1.value === date || selectedDate2.value === date;
    }

    function isInRange(date) {
      if (!allDatesSelected.value || isSingleMode.value) {
        return false;
      }

      return (
        (isAfter(date, selectedDate1.value) && isBefore(date, selectedDate2.value)) ||
        (isAfter(date, selectedDate1.value) && isBefore(date, hoverDate.value) && !allDatesSelected.value)
      );
    }

    function isDisabled(date) {
      return isDateDisabled(date) || isBeforeMinDate(date) || isAfterEndDate(date);
    }

    function getDayStyles(date) {
      const styles = {
        width: (width.value - 30) / 7 + 'px',
        background: isSelected(date)
          ? colors.value.selected
          : isHoveredInRange(date)
          ? colors.value.hoveredInRange
          : isInRange(date)
          ? colors.value.inRange
          : '',
        color: isSelected(date)
          ? colors.value.selectedText
          : isInRange(date) || isHoveredInRange(date)
          ? colors.value.selectedText
          : colors.value.text,
        border: isSelected(date)
          ? '1px double ' + colors.value.selected
          : (isInRange(date) && allDatesSelected.value) || isHoveredInRange(date)
          ? '1px double ' + colors.value.inRangeBorder
          : ''
      };

      if (isDisabled(date)) {
        styles.background = colors.value.disabled;
      }
      return styles;
    }

    function getAriaLabelForDate(date) {
      const dateLabel = format(date, dateLabelFormat.value);

      if (isDisabled(date)) {
        return ariaLabels.value.unavailableDate(dateLabel);
      }

      if (isSelected(date)) {
        return ariaLabels.value.selectedDate(dateLabel);
      }

      if (isRangeMode.value) {
        if (isSelectingDate1.value) {
          return ariaLabels.value.chooseStartDate(dateLabel);
        } else {
          return ariaLabels.value.chooseEndDate(dateLabel);
        }
      } else {
        return ariaLabels.value.chooseDate(dateLabel);
      }
    }

    function handleClickOutside(event) {
      if (event.target.id === props.triggerElementId || !showDatepicker.value || props.inline) {
        return;
      }
      closeDatepicker();
    }

    function shouldHandleInput(event, key) {
      return event.keyCode === key && (!event.shiftKey || event.keyCode === 191) && showDatepicker.value;
    }

    function handleTriggerInput(event) {
      if (props.mode === 'single') {
        setDateFromText(event.target.value);
      }
    }

    function trapKeyboardInput(event) {
      const shortcutKeyCodes = Object.keys(keys.value).map(key => keys.value[key]);
      shortcutKeyCodes.splice(shortcutKeyCodes.indexOf(13), 1);
      const shouldPreventDefault = shortcutKeyCodes.indexOf(event.keyCode) > -1;
      if (shouldPreventDefault) event.preventDefault();
    }

    function handleKeyboardInput(event) {
      if (shouldHandleInput(event, keys.value.esc)) {
        if (showKeyboardShortcutsMenu.value) {
          closeKeyboardShortcutsMenu();
        } else {
          closeDatepicker();
        }
      } else if (showKeyboardShortcutsMenu.value) {
      } else if (shouldHandleInput(event, keys.value.arrowDown)) {
        const newDate = addWeeks(focusedDate.value, 1);
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) nextMonth();
      } else if (shouldHandleInput(event, keys.value.arrowUp)) {
        const newDate = subWeeks(focusedDate.value, 1);
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) previousMonth();
      } else if (shouldHandleInput(event, keys.value.arrowRight)) {
        const newDate = addDays(focusedDate.value, 1);
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) nextMonth();
      } else if (shouldHandleInput(event, keys.value.arrowLeft)) {
        const newDate = subDays(focusedDate.value, 1);
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) previousMonth();
      } else if (shouldHandleInput(event, keys.value.enter)) {
        const target = event.target;
        if (!showKeyboardShortcutsMenu.value && target && target.tagName === 'TD') {
          selectDate(focusedDate.value);
        }
      } else if (shouldHandleInput(event, keys.value.pgUp)) {
        setFocusedDate(subMonths(focusedDate.value, 1));
        previousMonth();
      } else if (shouldHandleInput(event, keys.value.pgDn)) {
        setFocusedDate(addMonths(focusedDate.value, 1));
        nextMonth();
      } else if (shouldHandleInput(event, keys.value.home)) {
        const newDate = startOfWeek(focusedDate.value, {
          weekStartsOn: sundayFirst.value ? 0 : 1
        });
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) previousMonth();
      } else if (shouldHandleInput(event, keys.value.end)) {
        const newDate = endOfWeek(focusedDate.value, {
          weekStartsOn: sundayFirst.value ? 0 : 1
        });
        const changeMonths = !isSameMonth(newDate, focusedDate.value);
        setFocusedDate(newDate);
        if (changeMonths) nextMonth();
      } else if (shouldHandleInput(event, keys.value.questionMark)) {
        openKeyboardShortcutsMenu();
      }
    }

    function setDateFromText(value) {
      if (!value || value.length < 10) {
        return;
      }
      // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'
      const isFormatYearFirst = value.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/);
      const isFormatDayFirst = value.match(/^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/);

      if (!isFormatYearFirst && !isFormatDayFirst) {
        return;
      }
      if (isFormatDayFirst) {
        //convert to YYYY-MM-DD
        value = `${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`;
      }

      const valueAsDateObject = new Date(value);
      if (!isValid(valueAsDateObject)) {
        return;
      }
      const formattedDate = format(valueAsDateObject, dateFormat.value);
      if (isDateDisabled(formattedDate) || isBeforeMinDate(formattedDate) || isAfterEndDate(formattedDate)) {
        return;
      }
      startingDate.value = subMonths(formattedDate, 1);
      generateMonths();
      generateYears();
      selectDate(formattedDate);
    }

    function isMonthDisabled(year, monthIndex) {
      const monthDate = new Date(year, monthIndex);
      if (hasMinDate.value && isBefore(monthDate, startOfMonth(props.minDate))) {
        return true;
      }
      return isAfterEndDate(monthDate);
    }

    function generateMonths() {
      months.value = [];
      let currentMonth = startingDate.value;
      for (let i = 0; i < showMonths.value + 2; i++) {
        months.value.push(getMonthLocal(currentMonth));
        currentMonth = addMonthsLocal(currentMonth);
      }
    }

    function generateYears() {
      if (!props.showMonthYearSelect) return;
      years.value = [];
      const currentYear = getYear(startingDate.value);
      const startYear = props.minDate ? getYear(props.minDate) : currentYear - props.yearsForSelect;
      const endYear = props.endDate ? getYear(props.endDate) : currentYear + props.yearsForSelect;
      for (let year = startYear; year <= endYear; year++) {
        years.value.push(year.toString());
      }
    }

    // todo: fix this
    function setupDatepicker() {
      if (this.$options.ariaLabels) {
        this.ariaLabels = copyObject(this.$options.ariaLabels);
      }
      if (this.$options.keyboardShortcuts) {
        keyboardShortcuts.value = copyObject(this.$options.keyboardShortcuts);
      }
      if (this.$options.dateLabelFormat) {
        dateLabelFormat.value = copyObject(this.$options.dateLabelFormat);
      }
      if (this.$options.sundayFirst) {
        sundayFirst.value = copyObject(this.$options.sundayFirst);
      }
      if (this.$options.colors) {
        const colorsLocal = copyObject(this.$options.colors);
        colors.value.selected = colorsLocal.selected || colors.value.selected;
        colors.value.inRange = colorsLocal.inRange || colors.value.inRange;
        colors.value.hoveredInRange = colorsLocal.hoveredInRange || colors.value.hoveredInRange;
        colors.value.selectedText = colorsLocal.selectedText || colors.value.selectedText;
        colors.value.text = colors.value.text || colors.value.text;
        colors.value.inRangeBorder = colorsLocal.inRangeBorder || colors.value.inRangeBorder;
        colors.value.disabled = colorsLocal.disabled || colors.value.disabled;
      }
      if (this.$options.monthNames && this.$options.monthNames.length === 12) {
        monthNames.value = copyObject(this.$options.monthNames);
      }
      if (this.$options.days && this.$options.days.length === 7) {
        days.value = copyObject(this.$options.days);
      }
      if (this.$options.daysShort && this.$options.daysShort.length === 7) {
        daysShort.value = copyObject(this.$options.daysShort);
      }
      if (this.$options.texts) {
        const texts = copyObject(this.$options.texts);
        texts.value.apply = texts.apply || texts.value.apply;
        texts.value.cancel = texts.cancel || texts.value.cancel;
      }
    }

    function setStartDates() {
      let startDate = props.dateOne || new Date();
      if (hasMinDate.value && isBefore(startDate, props.minDate)) {
        startDate = props.minDate;
      }
      startingDate.value = subtractMonths(startDate);
      selectedDate1.value = props.dateOne;
      selectedDate2.value = props.dateTwo;
      focusedDate.value = startDate;
    }

    function setSundayToFirstDayInWeek() {
      const lastDay = days.value.pop();
      days.value.unshift(lastDay);
      const lastDayShort = daysShort.value.pop();
      daysShort.value.unshift(lastDayShort);
    }

    function getMonthLocal(date: string | Date) {
      const firstDateOfMonth = format(date, 'YYYY-MM-01');
      const year = format(date, 'YYYY');
      const monthNumber = parseInt(format(date, 'M'));
      const monthName = monthNames.value[monthNumber - 1];

      return {
        year,
        firstDateOfMonth,
        monthName,
        monthNumber,
        weeks: getWeeks(firstDateOfMonth)
      };
    }

    function getWeeks(date) {
      const weekDayNotInMonth = { dayNumber: 0 };
      const daysInMonth = getDaysInMonth(date);
      const year = format(date, 'YYYY');
      const month = format(date, 'MM');
      let firstDayInWeek = parseInt(format(date, sundayFirst.value ? 'd' : 'E'));
      if (sundayFirst.value) {
        firstDayInWeek++;
      }
      const weeks = [];
      let week = [];

      // add empty days to get first day in correct position
      for (let s = 1; s < firstDayInWeek; s++) {
        week.push(weekDayNotInMonth);
      }
      for (let d = 0; d < daysInMonth; d++) {
        const isLastDayInMonth = d >= daysInMonth - 1;
        const dayNumber = d + 1;
        const dayNumberFull = dayNumber < 10 ? '0' + dayNumber : dayNumber;
        week.push({
          dayNumber,
          dayNumberFull: dayNumberFull,
          fullDate: year + '-' + month + '-' + dayNumberFull
        });

        if (week.length === 7) {
          weeks.push(week);
          week = [];
        } else if (isLastDayInMonth) {
          for (let i = 0; i < 7 - week.length; i++) {
            week.push(weekDayNotInMonth);
          }
          weeks.push(week);
          week = [];
        }
      }
      return weeks;
    }

    function selectDate(date) {
      if (isBeforeMinDate(date) || isAfterEndDate(date) || isDateDisabled(date)) {
        return;
      }

      if (props.mode === 'single') {
        selectedDate1.value = date;
        closeDatepicker();
        return;
      }

      if (isSelectingDate1.value || isBefore(date, selectedDate1.value)) {
        selectedDate1.value = date;
        isSelectingDate1.value = false;

        if (isBefore(selectedDate2.value, date)) {
          selectedDate2.value = '';
        }
      } else {
        selectedDate2.value = date;
        isSelectingDate1.value = true;

        if (isAfter(selectedDate1.value, date)) {
          selectedDate1.value = '';
        } else if (props.showActionButtons) {
          // if user has selected both dates, focus the apply button for accessibility
          applyButtonRef.value.focus();
        }

        if (allDatesSelected.value && props.closeAfterSelect) {
          closeDatepicker();
        }
      }
    }

    function setHoverDate(date) {
      hoverDate.value = date;
    }

    function setFocusedDate(date) {
      const formattedDate = format(date, dateFormat.value);
      focusedDate.value = formattedDate;
      const dateElement = fullDatesRef.value[formattedDate];
      // handle .focus() on ie11 by adding a short timeout
      if (dateElement && dateElement.length) {
        setTimeout(function() {
          dateElement[0].focus();
        }, 10);
      }
    }

    function resetFocusedDate(setToFirst) {
      if (focusedDate.value && !isDateVisible(focusedDate.value)) {
        const visibleMonthIdx = setToFirst ? 0 : visibleMonths.value.length - 1;
        const targetMonth = visibleMonths.value[visibleMonthIdx];
        const monthIdx = getMonth(targetMonth);
        const year = getYear(targetMonth);
        const newFocusedDate = setYear(setMonth(focusedDate.value, monthIdx), year);
        focusedDate.value = format(newFocusedDate, dateFormat.value);
      }
    }

    function isToday(date) {
      return format(new Date(), dateFormat.value) === date;
    }

    function isSameDate(date1, date2) {
      return isSameDay(date1, date2);
    }

    function isHoveredInRange(date) {
      if (isSingleMode.value || allDatesSelected.value) {
        return false;
      }

      return (
        (isAfter(date, selectedDate1.value) && isBefore(date, hoverDate.value)) ||
        (isAfter(date, hoverDate.value) && isBefore(date, selectedDate1.value))
      );
    }

    function isBeforeMinDate(date) {
      if (!props.minDate) {
        return false;
      }
      return isBefore(date, props.minDate);
    }

    function isAfterEndDate(date) {
      if (!props.endDate) {
        return false;
      }
      return isAfter(date, props.endDate);
    }

    function isDateVisible(date) {
      if (!date) {
        return false;
      }
      const start = subDays(visibleMonths.value[0], 1);
      const end = addDays(lastDayOfMonth(visibleMonths.value[props.monthsToShow - 1]), 1);
      return isAfter(date, start) && isBefore(date, end);
    }

    function isDateDisabled(date) {
      if (props.enabledDates.length > 0) {
        return props.enabledDates.indexOf(date) === -1;
      } else {
        return props.disabledDates.indexOf(date) > -1;
      }
    }

    function customizedDateClass(date) {
      let customizedClasses = '';
      if (props.customizedDates.length > 0) {
        for (let i = 0; i < props.customizedDates.length; i++) {
          if (props.customizedDates[i].dates.indexOf(date) > -1)
            customizedClasses += ` asd__day--${props.customizedDates[i].cssClass}`;
        }
      }
      return customizedClasses;
    }

    function subtractMonths(date) {
      return format(subMonths(date, 1), dateFormat.value);
    }

    function addMonthsLocal(date) {
      return format(addMonths(date, 1), dateFormat.value);
    }

    function previousMonth() {
      startingDate.value = subtractMonths(months.value[0].firstDateOfMonth);

      months.value.unshift(getMonthLocal(startingDate.value));
      months.value.splice(months.value.length - 1, 1);
      emit('previous-month', visibleMonths.value);
      resetFocusedDate(false);
    }

    function nextMonth() {
      startingDate.value = addMonthsLocal(months.value[months.value.length - 1].firstDateOfMonth);

      months.value.push(getMonthLocal(startingDate.value));
      months.value.splice(0, 1);
      emit('next-month', visibleMonths.value);
      resetFocusedDate(true);
    }

    function toggleDatepicker() {
      if (showDatepicker.value) {
        closeDatepicker();
      } else {
        openDatepicker();
      }
    }

    function updateMonth(offset, year, event) {
      const newMonth = event.target.value;
      const monthIdx = monthNames.value.indexOf(newMonth);
      const newDate = setYear(setMonth(startingDate.value, monthIdx), year);
      startingDate.value = subMonths(newDate, offset);
      generateMonths();
    }

    function updateYear(offset, monthIdx, event) {
      const newYear = event.target.value;
      const newDate = setYear(setMonth(startingDate.value, monthIdx), newYear);
      startingDate.value = subMonths(newDate, offset);
      generateMonths();
    }

    function openDatepicker() {
      positionDatepicker();
      setStartDates();
      triggerElement.value.classList.add('datepicker-open');
      showDatepicker.value = true;
      // initialDate1.value = props.dateOne;
      // initialDate2.value = props.dateTwo;
      emit('opened');
      nextTick(() => {
        if (!props.inline) setFocusedDate(focusedDate.value);
      });
    }

    function closeDatepickerCancel() {
      if (showDatepicker.value) {
        // selectedDate1.value = initialDate1.value;
        // selectedDate2.value = initialDate2.value;
        emit('cancelled');
        closeDatepicker();
      }
    }

    function closeDatepicker() {
      if (props.inline) {
        return;
      }
      showDatepicker.value = false;
      showKeyboardShortcutsMenu.value = false;
      triggerElement.value.classList.remove('datepicker-open');
      emit('closed');
    }

    function openKeyboardShortcutsMenu() {
      showKeyboardShortcutsMenu.value = true;
      const shortcutMenuCloseBtn = keyboardShortcutsMenuClosRef.value;
      nextTick(() => shortcutMenuCloseBtn.focus());
    }

    function closeKeyboardShortcutsMenu() {
      showKeyboardShortcutsMenu.value = false;
      nextTick(() => setFocusedDate(focusedDate.value));
    }

    function apply() {
      emit('apply');
      closeDatepicker();
    }

    function positionDatepicker() {
      const triggerWrapperElement = findAncestor(triggerElement.value, '.datepicker-trigger');
      triggerPosition.value = triggerElement.value.getBoundingClientRect();
      if (triggerWrapperElement) {
        triggerWrapperPosition.value = triggerWrapperElement.getBoundingClientRect();
      } else {
        triggerWrapperPosition.value = { left: 0, right: 0 };
      }

      const viewportWidthComputed = document.documentElement.clientWidth || window.innerWidth;
      viewportWidth.value = viewportWidthComputed + 'px';
      isMobile.value = viewportWidthComputed < 768;
      isTablet.value = viewportWidthComputed >= 768 && viewportWidthComputed <= 1024;
      showMonths.value = isMobile.value ? 1 : isTablet.value && props.monthsToShow > 2 ? 2 : props.monthsToShow;

      nextTick(function() {
        const datepickerWrapper = document.getElementById(wrapperId.value);
        if (!triggerElement.value || !datepickerWrapper) {
          return;
        }

        const rightPosition =
          triggerElement.value.getBoundingClientRect().left + datepickerWrapper.getBoundingClientRect().width;
        alignRight.value = rightPosition > viewportWidthComputed;
      });
    }

    watch(selectedDate1, newValue => {
      const newDate = !newValue || newValue === '' ? '' : format(newValue, dateFormat.value);
      emit('date-one-selected', newDate);
    });
    watch(selectedDate2, newValue => {
      const newDate = !newValue || newValue === '' ? '' : format(newValue, dateFormat.value);
      emit('date-two-selected', newDate);
    });
    watch(
      () => props.mode,
      () => {
        setStartDates();
      }
    );
    watch(
      () => props.minDate,
      () => {
        setStartDates();
        generateMonths();
        generateYears();
      }
    );
    watch(
      () => props.endDate,
      () => {
        generateYears();
      }
    );
    watch(datePropsCompound, () => {
      if (props.dateOne !== selectedDate1.value) {
        startingDate.value = props.dateOne;
        setStartDates();
        generateMonths();
        generateYears();
      }
      if (isDateTwoBeforeDateOne.value) {
        selectedDate2.value = '';
        emit('date-two-selected', '');
      }
    });
    watch(
      () => props.trigger,
      newValue => {
        if (newValue) {
          setTimeout(() => {
            openDatepicker();
          }, 0);
        }
      }
    );

    onClickOutside(wrapperRef, event => {
      handleClickOutside(event);
    });

    onBeforeMount(() => {
      // setupDatepicker();
      if (sundayFirst.value) {
        setSundayToFirstDayInWeek();
      }
    });

    const handleWindowResizeEvent = useDebounceFn(() => {
      positionDatepicker();
      setStartDates();
    }, 200);

    function handleWindowClickEvent(event) {
      if (event.target.id === props.triggerElementId) {
        event.stopPropagation();
        event.preventDefault();
        toggleDatepicker();
      }
    }

    onMounted(() => {
      viewportWidth.value = window.innerWidth + 'px';
      isMobile.value = window.innerWidth < 768;
      isTablet.value = window.innerWidth >= 768 && window.innerWidth <= 1024;
      window.addEventListener('resize', handleWindowResizeEvent);

      triggerElement.value = props.isTest
        ? document.createElement('input')
        : document.getElementById(props.triggerElementId);

      setStartDates();
      generateMonths();
      generateYears();

      if (props.startOpen || props.inline) {
        openDatepicker();
      }

      wrapperRef.value.addEventListener('keyup', handleKeyboardInput);
      wrapperRef.value.addEventListener('keydown', trapKeyboardInput);
      triggerElement.value.addEventListener('keyup', handleTriggerInput);
      triggerElement.value.addEventListener('click', handleWindowClickEvent);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleWindowResizeEvent);
      window.removeEventListener('click', handleWindowClickEvent);

      const wrapperEl = document.querySelector(`#${wrapperId.value}`);
      if (wrapperEl) {
        wrapperEl.removeEventListener('keyup', handleKeyboardInput);
        wrapperEl.removeEventListener('keydown', trapKeyboardInput);
      }

      if (triggerElement.value) {
        triggerElement.value.removeEventListener('keyup', handleTriggerInput);
        triggerElement.value.removeEventListener('click', handleWindowClickEvent);
      }
    });

    return {
      // refs
      applyButtonRef,
      wrapperRef,
      keyboardShortcutsMenuClosRef,
      fullDatesRef,
      // reactive data
      showDatepicker,
      wrapperId,
      ariaLabels,
      showMonths,
      width,
      daysShort,
      months,
      monthNames,
      years,
      focusedDate,
      selectedDate1,
      selectedDate2,
      showKeyboardShortcutsMenu,
      keyboardShortcuts,
      texts,
      colors,
      // computed property
      wrapperClasses,
      showFullscreen,
      wrapperStyles,
      mobileHeaderFallback,
      monthWidthStyles,
      innerStyles,
      keyboardShortcutsMenuStyles,
      // methods
      handleClickOutside,
      closeDatepicker,
      previousMonth,
      nextMonth,
      updateMonth,
      isMonthDisabled,
      updateYear,
      isDateVisible,
      isSameDate,
      getAriaLabelForDate,
      isDisabled,
      isInRange,
      isToday,
      isHoveredInRange,
      customizedDateClass,
      getDayStyles,
      setHoverDate,
      selectDate,
      closeKeyboardShortcutsMenu,
      closeDatepickerCancel,
      openKeyboardShortcutsMenu,
      apply
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
    top: 0;
    bottom: 0;
    right: 0;
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
    color: dodgerblue;
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
