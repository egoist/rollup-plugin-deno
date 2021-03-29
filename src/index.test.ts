import { OutputChunk, rollup } from 'rollup'
import deno from './'

const build = async (code: string) => {
  const bundle = await rollup({
    input: './index.ts',
    plugins: [
      {
        name: 'virtual-file',
        resolveId(source) {
          if (source[0] === '.') return source
        },
        load() {
          return code
        },
      },
      deno(),
    ],
  })
  const result = await bundle.generate({ format: 'esm', file: 'out.js' })
  const file = result.output.find(
    (file) => file.fileName === 'out.js',
  ) as OutputChunk
  return file.code
}

test('node to deno', async () => {
  const output = await build(`import path from 'path'
  export const args = process.argv.slice(2)
  export const dir = path.join(__dirname, 'foo')`)

  expect(output).toMatchInlineSnapshot(`
    "import * as _deno_path from 'https://deno.land/std@0.90.0/path/mod.ts';
    import processModule from \\"https://deno.land/std@0.90.0/node/process.ts\\";
      !globalThis.process && Object.defineProperty(globalThis, \\"process\\", {
        value: processModule,
        enumerable: false,
        writable: true,
        configurable: true,
      });import path from 'https://deno.land/std@0.90.0/node/path.ts';

    const args = process.argv.slice(2);
      const dir = path.join(_deno_path.dirname(_deno_path.fromFileUrl(import.meta.url)), 'foo');

    export { args, dir };
    "
  `)
})

test('timer', async () => {
  const output = await build(`setImmediate(() => {})`)
  expect(output).toMatchInlineSnapshot(`
    "import _node_timers from \\"https://deno.land/std@0.90.0/node/timers.ts\\";
      !globalThis.setImmediate && Object.defineProperty(globalThis, \\"setImmediate\\", {
        value: _node_timers.setImmediate,
        enumerable: true,
        writable: true,
        configurable: true,
      });
      !globalThis.clearImmediate && Object.defineProperty(globalThis, \\"clearImmediate\\", {
        value: _node_timers.clearImmediate,
        enumerable: true,
        writable: true,
        configurable: true,
      });setImmediate(() => {});
    "
  `)
})
