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
var spawn = require('child_process').spawn;

var gulp = require('gulp');
var rimraf = require('rimraf');
var gulpProtractor = require('gulp-protractor');
var connect = require('connect');
var http = require('http');

var buildDir = './build';
var staticDir = path.join(buildDir, 'static');

/*
 * Index file stuff.
 */
var indexGlob = ['./src/index.html', './src/index.js'];
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

/*
 * Tests.
 */


// @TODO: how to start webdriver? or ghostdriver?
// ghostdriver is preferred because it's faster.
// For now can start it manuall in another process.
gulp.task('test:e2e', function(){
  // Setup server.
  var app = connect().use(connect.static(staticDir));
  var server = http.createServer(app);
  var port = 8000;
  server.listen(8000)
  var baseUrl = 'http://127.0.0.1:' + port;

  // Setup phantom as webdriver.
  var phantomProc = spawn('phantomjs', ['--webdriver', '4444']);

  var cleanup = function(){
    server.close();
    phantomProc.kill();
  };

  gulp.src(['./test/e2e/specs/*.spec.js'])
  .pipe(gulpProtractor.protractor({
    configFile: './test/e2e/protractor.conf.js',
    args: ['--baseUrl', baseUrl]
  }))
  .on('error', cleanup)
  .on('end', cleanup);
});
