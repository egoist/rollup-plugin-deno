**💛 You can help the author become a full-time open-source maintainer by [sponsoring him on GitHub](https://github.com/sponsors/egoist).**

---

# rollup-plugin-deno

[![npm version](https://badgen.net/npm/v/rollup-plugin-deno)](https://npm.im/rollup-plugin-deno)

This plugin uses [Deno's Node.js compatibility layer](https://deno.land/std@0.90.0/node/README.md), not all built-in Node.js modules are supported.

## Install

```bash
npm i rollup-plugin-deno -D
```

## Usage

```js
import deno from 'rollup-plugin-deno'

export default {
  input: './index.ts',
  output: {
    format: 'esm',
    file: 'mod.js',
  },
  plugins: [deno()],
}
```

It's also recommended to use [rollup-plugin-dts](https://github.com/Swatinem/rollup-plugin-dts) to bundle your TypeScript declaration file.

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
