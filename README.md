# vue-use-hotkeys

Vue composition for using keyboard shortcuts in components. Inspired by [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook).
This is a hook version for [hotkeys](https://github.com/jaywcjlove/hotkeys) package.

## Install

via pnpm, yarn or npm:

```sh
$ pnpm add vue-use-hotkeys
# or
$ yarn add vue-use-hotkeys
# or
$ npm i -S vue-use-hotkeys
```

## Usage

```jsx
import { defineComponent, ref } from 'vue';
import { useHotkeys } from 'vue-use-hotkeys';

export default defineComponent(() => {
  const count = ref(0);

  useHotKeys('ctrl + k', () => {
    count.value += 1;
  });

  return () => (
    <p>
      Pressed <kbd>ctrl + k</kbd> {count.value} times.
    </p>
  );
});
```

# To-Do(s)

- [x] add support of `@vue/composition-api`;

## License

MIT &copy; [Mitscherlich](https://mitscherlich.me)
