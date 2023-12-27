// import autoprefixer from 'gulp-autoprefixer';

const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const postcss= require("gulp-postcss");
const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');              // для очистки папки и др.
const avif = require('gulp-avif');                // формат
const webp = require('gulp-webp');                // формат
const imagemin = require('gulp-imagemin');        // для уменьшения размеров png, jpg и вроде как svg
const fonter = require('gulp-fonter');        
const ttf2woff2 = require('gulp-ttf2woff2');       
const newer = require('gulp-newer');              // чтобы проходили только новые изображения, как кэш
const svgSprite = require('gulp-svg-sprite');     // делает из нескольких svg один svg, чтобы загружать его сразу
const include = require('gulp-include');
// const autoprefixer = require('gulp-autoprefixer');

function pages() {
  return src('app/pages/*.html')
    .pipe(include({
      includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/src/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']      // конвертирует в эти форматы
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'))
}

function images() {
  return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({quality: 50}))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())
    
    .pipe(dest('app/images'))
}

function sprite() {
  return src('app/images/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/images'))
}

function scripts() {
  return src([
    'app/js/main.js',

    // 'app/js/*.js',
    // '!app/js/main.min.js'  все файлы, кроме этого
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 10 version']})]))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "app/"
    }
  });

  watch(['app/scss/style.scss'], styles)
  watch(['app/images/src/'], images)
  watch(['app/js/main.js'], scripts)
  watch(['app/components/*', 'app/pages/*'], pages)
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
  return src('dist')
    .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/images/*.*',
    '!app/images/*.svg',
    'app/images/sprite.svg',
    'app/fonts/*.*',
    'app/js/main.min.js',
    'app/*.html'
  ], {base: 'app'})
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, pages, watching);