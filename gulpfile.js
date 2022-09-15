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
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('source/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest("build"));
}

// Scripts

const scripts = () => {
  return gulp.src("source/js/*.js")
  .pipe(terser())
  .pipe(gulp.dest("build/js"));
}

// Images

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(squoosh())
  .pipe(gulp.dest("build/img"));
}

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(gulp.dest("build/img"));
}

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(squoosh({webp: {}}))
  .pipe(gulp.dest("build/img"));
}

// SVG - оптимизировать не надо? Т.к. у меня уже все svg включены в спрайт...

/*const svg = () => {
  return gulp.src("source/img/*.svg")
  .pipe(svgo())
  .pipe(gulp.dest("build/img"));
}*/

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
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
}

// Clean - не срабатывает

const clean = () => {
  return { deleteAsync }("build");
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher - нужно ли сюда дописать scripts?

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);



export default gulp.series(
  html, scripts, optimizeImages, createWebp, sprite, copy, clean, styles, server, watcher
);
