import async from 'rollup-plugin-async';
import commonjs from 'rollup-plugin-commonjs'; // Converte módulos CommonJS para ES6
import vue from 'rollup-plugin-vue'; // Manipula arquivos .vue
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
// import buble from 'rollup-plugin-buble'; // Transpila com considerável suporte a navegadores
export default {
  input: 'src/wrapper.js', // Caminho relativo ao package.json
  output: {
    name: 'VueAddressAutocomplete',
    exports: 'named',
  },
  plugins: [
    commonjs(),
    vue({
      css: true, // Dinamicamente injeta CSS como uma tag <style>
      compileTemplate: true, // Explicitamente converte template para função render
    }),
    async(),
    resolve({ jsnext: true, preferBuiltins: true, browser: true }),
    json()
    // buble(), // Transpila para ES5
  ],
};