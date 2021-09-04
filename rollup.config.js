import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript';

import {chromeExtension} from 'rollup-plugin-chrome-extension'
import del from 'rollup-plugin-delete'
import zip from 'rollup-plugin-zip'

export default {
    input: 'src/manifest.json',
    output: {
        dir: 'dist',
        format: 'esm',
    },
    plugins: [
        chromeExtension({browserPolyfill: true}),
        typescript(),
        resolve(),
        del({targets: 'dist/*'}),
        zip(),
    ],
}
