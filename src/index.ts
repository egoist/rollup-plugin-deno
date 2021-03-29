import { builtinModules } from 'module'
import { Plugin } from 'rollup'

const DENO_STD_PATH = `https://deno.land/std@0.90.0`

const getPolyfillPath = (name: string) => `${DENO_STD_PATH}/node/${name}.ts`

const injectGlobalShimForDenoBuild = (code: string) => {
  const processRe = /\bprocess\b/
  const globalRe = /\bglobal\b/
  const bufferRe = /\bBuffer\b/
  const setImmediateRe = /\b(setImmediate|clearImmediate)\b/
  const filenameRe = /\b(__filename|__dirname)\b/g

  if (processRe.test(code)) {
    code =
      `import processModule from "${getPolyfillPath('process')}";
  !globalThis.process && Object.defineProperty(globalThis, "process", {
    value: processModule,
    enumerable: false,
    writable: true,
    configurable: true,
  });` + code
  }

  if (globalRe.test(code)) {
    code =
      `!globalThis.global && Object.defineProperty(globalThis, "global", {
    value: globalThis,
    writable: false,
    enumerable: false,
    configurable: true,
  });` + code
  }

  if (bufferRe.test(code)) {
    code =
      `import { Buffer as bufferModule } from "${getPolyfillPath('buffer')}";
  !globalThis.Buffer && Object.defineProperty(globalThis, "Buffer", {
    value: bufferModule,
    enumerable: false,
    writable: true,
    configurable: true,
  });` + code
  }

  if (setImmediateRe.test(code)) {
    code =
      `!globalThis.setImmediate && Object.defineProperty(globalThis, "setImmediate", {
    value: timers.setImmediate,
    enumerable: true,
    writable: true,
    configurable: true,
  });
  
  !globalThis.clearImmediate && Object.defineProperty(globalThis, "clearImmediate", {
    value: timers.clearImmediate,
    enumerable: true,
    writable: true,
    configurable: true,
  });` + code
  }

  if (filenameRe.test(code)) {
    code = code.replace(filenameRe, (_, m) => {
      return m === '__filename'
        ? `_deno_path.fromFileUrl(import.meta.url)`
        : `_deno_path.dirname(_deno_path.fromFileUrl(import.meta.url))`
    })
    code =
      `import * as _deno_path from '${DENO_STD_PATH}/path/mod.ts';\n` + code
  }

  return code
}

const denoPlugin = (): Plugin => {
  return {
    name: 'deno',

    resolveId(source) {
      if (builtinModules.includes(source)) {
        return {
          id: getPolyfillPath(source),
          external: true,
        }
      }
    },

    // Breaks sourcemap, but whatever
    renderChunk(code) {
      return injectGlobalShimForDenoBuild(code)
    },
  }
}

export default denoPlugin
