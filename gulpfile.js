var gulp = require('gulp');
var eslint = require('gulp-eslint');
var es = require('event-stream');
var csslint = require('gulp-csslint');
var sass = require('gulp-sass');
var sasslint = require('gulp-sass-lint');
var tap = require('gulp-tap');
var execSync = require('sync-exec');
var options = require('minimist')(process.argv.slice(2));
var phpcs = require('gulp-phpcs');

gulp.task('jslint', function() {
  var modules = gulp.src('docroot/sites/all/modules/custom/**/*.js');
  var themes = gulp.src('docroot/sites/all/themes/**/*.js');

  return es.merge(modules, themes)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('csslint', function() {
  var modules = gulp.src('docroot/sites/all/modules/custom/**/*.css');
  var themes = gulp.src('docroot/sites/all/themes/**/*.css');

  return es.merge(modules, themes)
    .pipe(csslint())
    .pipe(csslint.reporter())
    .pipe(csslint.reporter('fail'));
});

gulp.task('scsslint', function () {
  return gulp.src('docroot/sites/all/themes/sass/**/*.s+(a|c)ss')
   .pipe(sasslint())
   .pipe(sasslint.format())
   .pipe(sasslint.failOnError());
 });

gulp.task('php', function () {
  // Source file defaults to a pattern.
  var extensions = '{php,module,inc,install,test,profile,theme}',
    sourcePatterns = [
      'docroot/sites/all/modules/custom/**/*.' + extensions,
      'docroot/sites/all/modules/features/**/*.' + extensions,
      'docroot/sites/all/themes/custom/**/*.' + extensions
    ],
    excludePatterns = [
      '!**/*.apachesolr_environments.inc',
      '!**/*.apachesolr_search_defaults.inc',
      '!**/*.context.inc',
      '!**/*.features.*.inc',
      '!**/*.features.inc',
      '!**/*.field_group.inc',
      '!**/*.pages_default.inc',
      '!**/*.strongarm.inc',
      '!**/*.views_default.inc'
    ];

  // If path is provided, override.
  if (options.hasOwnProperty('path') && options.path.length > 0) {
    sourcePatterns = [
      options.path + '/*.' + extensions,
      options.path + '/**/*.' + extensions
    ];
  }

  // Merge sourcePatters with excludePatterns.
  sourcePatterns = sourcePatterns.concat(excludePatterns);

  // Run phpcs.
  return gulp.src(sourcePatterns)
    .pipe(phpcs({
      bin: './vendor/bin/phpcs',
      standard :  './.phpcsrc.xml',
      warningSeverity: 0
    }))
    .pipe(phpcs.reporter('log'))
    .pipe(phpcs.reporter('fail'));

});

gulp.task('default', [
  'jslint',
  'csslint',
  'scsslint',
  'php'
]);
