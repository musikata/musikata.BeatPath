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
var http = require('http');

var gulp = require('gulp');
var rimraf = require('rimraf');
var gulpProtractor = require('gulp-protractor');
var connect = require('connect');
var bowerRequirejs = require('bower-requirejs');
var requirejs = require('requirejs');
var _ = require('lodash');


/*
 * Define build dirs.
 */
var buildDir = './build';
var staticDir = path.join(buildDir, 'static');
var staticDirs = {root: staticDir};
_.each(['js'], function(subdir){
  staticDirs[subdir] = path.join(staticDir, subdir);
});
_

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
 * Javascript build.
 */
gulp.task('build:js', function(){
  bowerRequirejs({transitive: true}, function(rjsConfigFromBower){
    var commonRjsConfig = _.extend({
      findNestedDependencies: true,
      generateSourceMaps: false,
      preserveLicenseComments: false,
      optimize: "none",
      shim: {
        'handlebars': {exports: 'Handlebars'},
      },
    }, rjsConfigFromBower);

    // Add path aliases.
    var pathAliases = {
      'backbone.marionette': ['marionette'],
      'requirejs-text': ['text'],
    };
    _.each(pathAliases, function(aliases, canonicalName){
      var canonicalPath = commonRjsConfig.paths[canonicalName];
      _.each(aliases, function(alias){
        commonRjsConfig.paths[alias] = canonicalPath;
      });
    });

    var optimizerConfig = _.extend({
      name: 'almond',
      out: path.join(staticDirs.js, 'app.js'),
      include: ['src/app/BeatPathApp'],
      insertRequire: ['src/app/BeatPathApp'],
    }, commonRjsConfig);

    requirejs.optimize(optimizerConfig, function (buildResponse) {
      console.log('requirejs build complete');
    }, function(err) {
      console.log('rjs error: ', err);
    });
  });
});

/*
 * Setup watchers.
 */
gulp.task('watch', function() {

  // Watch index.
  gulp.watch(indexGlob, function(){
    gulp.run('copy:index');
  });

  // Watch app js.
  gulp.watch(['src/app/**/*'], function(){
    gulp.run('build:js');
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
