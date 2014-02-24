/* 
 * Goal of build is to produce a standalone directory like this:
 * /app
 * - static/
 *   - index.html
 *   - js/
 *    - build_xxx.js
 *   - sounds/
 *    - high.mp3
 *   - ...
 *   - img/
 *    - bg.png
 *    - drum.png
 *   - ...
 *   - css/
 *    - app.css
 *   - font/
 *    - font.otf
 *   - ...
 *
 * Steps to do this include:
 * - compiling CSS, copying
 * - building js, copying
 * - copying assets
 */

var path = require('path');

var gulp = require('gulp');
var rimraf = require('rimraf');


var buildDir = './build';
var staticDir = path.join(buildDir, 'static');

/*
 * Index file stuff.
 */
var indexGlob = ['./src/index.html'];
gulp.task('copy:index', function(){
  return gulp.src(indexGlob)
  .pipe(gulp.dest(staticDir));
});

/*
 * Cleaners.
 */
gulp.task('clean:all', function(){
  rimraf(buildDir, function(error){console.error(error)});
});

/*
 * Setup watchers.
 */
gulp.task('watch', function() {
  // watch index files
  gulp.watch(indexGlob, function(){
    gulp.run('copy:index');
  });
});

