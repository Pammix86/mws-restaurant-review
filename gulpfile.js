const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const useref = require("gulp-useref");
const gulpif = require("gulp-if");
const csso = require("gulp-csso");
const autoprefixer = require("gulp-autoprefixer");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

gulp.task("sass", function() {
  return gulp
    .src("/scss/main.scss")
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest("src/css"));
});

gulp.task("watch", function() {
  gulp.watch("scss/**/*.scss", gulp.series("sass", "reload"));
  // gulp.watch("**/*.{html,js,css}", gulp.series("reload"));
  gulp.watch("**/*.{html,js,css}");
});

gulp.task("serve", function() {
  browserSync.init({
    server: "./",
    port: 4000
  });
});
//Browser Reload Function
gulp.task("reload", function(done) {
  browserSync.reload();
  done();
});

gulp.task("es6", function() {
  return gulp
    .src(["node_modules/babel-polyfill/dist/polyfill.js", "js/*.js"])
    .pipe(babel({ presets: ["es2015"] }))
    .pipe(gulp.dest("dist/js"));
});

//Copy images in dist folder
gulp.task("images", function() {
  return gulp.src("images/**/*").pipe(gulp.dest("dist/images"));
});

//Minify CSS
gulp.task("minifyCSS", function() {
  return gulp
    .src("css/*.css")
    .pipe(csso())
    .pipe(gulp.dest("dist/css"));
});

gulp.task("useref", function() {
  return (
    gulp
      .src(["*.html", "manifest.json", "service-Worker.js"])
      // .pipe(useref())
      //.pipe(gulpif("compiled/*.js", uglify()))
      .pipe(gulp.dest("dist"))
  );
});

gulp.task("default", gulp.parallel("serve", "watch"));
gulp.task("build", gulp.series("es6", "useref", "images", "minifyCSS"));
