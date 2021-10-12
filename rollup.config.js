import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";
import clear from "rollup-plugin-clear";

const babelOptionsES2018 = {
    runtimeHelpers:  false,
    externalHelpers: false,
    babelrc:         false,
    plugins:         [
        ["@babel/plugin-proposal-class-properties", {loose: true}],
        ["@babel/plugin-proposal-private-property-in-object", {loose: true}],
        ["@babel/plugin-proposal-private-methods", { loose: true }],
    ]
};

// https://rollupjs.org/guide/en#big-list-of-options
export default [
    // ES Modules Minified
    {
        input:   './src/index.js',
        output:  {
            file:      './dist/translator.min.js',
            format:    'esm',
            compact:   true,
            sourcemap: true,
        },
        plugins: [
            clear({targets: ['./dist']}),
            resolve(),
            babel(babelOptionsES2018),
            terser(),
        ]
    },
    // ES Modules None-Minified
    {
        input:   './src/index.js',
        output:  {
            file:      './dist/translator.js',
            format:    'esm',
            compact:   false,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            babel(babelOptionsES2018),
        ]
    },
];
