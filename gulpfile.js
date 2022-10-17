"use strict";

// region init variables for all
const { src, dest, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
// endregion

// region init variables for js
const uglify = require('gulp-uglify');
const stripDebug = require('gulp-strip-debug');
const rmLines = require('gulp-rm-lines');
const iife = require("gulp-iife");
// endregion

// region tasks functions
function js(done) {
    let filename = 'uasset-reader.js';

    src([
        './src/js/_namespace_.js',
        './src/js/enums/enums.js',
        './src/js/main.js',
    ])
        .pipe(rmLines({
            'filters': [
                /GULP REMOVE LINE/i,
            ]
        }))
        .pipe(concat(filename))
        .pipe(iife())
        .pipe(dest('./dist/'))
        .on('end', done);
}

function jsProd(done) {
    let filename = 'uasset-reader.min.js';

    src([
        './src/js/_namespace_.js',
        './src/js/enums/enums.js',
        './src/js/main.js',
    ])
        .pipe(rmLines({
            'filters': [
                /GULP REMOVE LINE/i,
            ]
        }))
        .pipe(stripDebug())
        .pipe(uglify({mangle: {keep_fnames: true}}))
        .pipe(concat(filename))
        .pipe(iife())
        .pipe(dest('./dist/'))
        .on('end', done);
}

function watchers(done) {
    watch([
        './src/js/_namespace_.js',
        './src/js/enums/enums.js',
        './src/js/main.js',
    ], js, jsProd);

    done();
}
// endregion

// region exports task
exports.default = watchers;
exports.js = parallel(js, jsProd);
// endregion
