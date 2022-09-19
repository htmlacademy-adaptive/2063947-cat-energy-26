import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import { deleteAsync } from 'del';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import rename from 'gulp-rename';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import terser from 'gulp-terser';
import csso from 'postcss-csso';

// Styles

export const styles = () => {
  return gulp
    .src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('build/css'))
    .pipe(postcss([csso()]))
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src("source/*.html")
  /*.pipe(htmlmin({collapseWhitespace: true}))*/
  .pipe(gulp.dest("build"));
}

// Scripts

const scripts = () => {
  return gulp
    .src('source/js/*.js', { sourcemaps: true })
    .pipe(gulp.dest('build/js'))
    .pipe(terser())
    .pipe(rename("scripts.min.js"))
    .pipe(gulp.dest('build/js', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Images + WebP

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(squoosh())
  .pipe(gulp.dest("build/img"));
}

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(squoosh({webp: {}}))
  .pipe(gulp.dest("source/img"));
}

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,webp,svg}")
  .pipe(gulp.dest("build/img"));
}

// Sprite

const sprite = () => {
  return gulp.src("source/img/*.svg")
  .pipe(svgo())
  .pipe(svgstore({inlineSvg: true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
}

// Copy

const copy = (done) => {
  return gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/*.png"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
}

// Clean

const clean = () => {
  return deleteAsync('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', gulp.series(html), browser.reload);
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(styles, html, scripts, copyImages, sprite, createWebp)
);

export default gulp.series(
  clean,
  copy,
  gulp.parallel(styles, html, copyImages, scripts, sprite, createWebp),
  server,
  watcher
);
