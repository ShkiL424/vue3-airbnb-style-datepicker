<script lang="ts">
import { defineComponent } from 'vue';
import Vue3AirbnbStyleDatepicker from '@/vue3-airbnb-style-datepicker.vue';

export default defineComponent({
  name: 'ServeDev',
  components: {
    Vue3AirbnbStyleDatepicker
  }
});
</script>

<template>
  <div id="app">
    <vue3-airbnb-style-datepicker />
  </div>
</template>
