<script setup>
import { ref } from 'vue';
import { useHotkeys } from '..';

const count_1 = ref(0);
const count_2 = ref(0);

const key = 'shift + a';

useHotkeys(key, () => {
  count_1.value += 1;
});

const btnRef = useHotkeys(key, () => {
  count_2.value += 1;
});
</script>

<template>
  <p>
    Pressed <kbd>{{ key }}</kbd> {{ count_1 }} times.
  </p>

  <p>
    <button ref="btnRef">Click Me</button>
  </p>

  <p>
    Pressed <kbd>{{ key }}</kbd> upon this button {{ count_2 }} times.
  </p>
</template>
