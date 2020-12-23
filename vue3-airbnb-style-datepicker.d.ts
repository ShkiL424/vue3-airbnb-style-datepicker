import { DefineComponent, Plugin } from 'vue';

declare const Vue3AirbnbStyleDatepicker: DefineComponent & { install: Exclude<Plugin['install'], undefined> };
export default Vue3AirbnbStyleDatepicker;
