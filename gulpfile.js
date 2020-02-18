var gulp = require('gulp');
// var polybuild = require('polybuild');
var vulcanize = require('gulp-vulcanize');
var crisper = require('gulp-crisper');
var sync = require('gulp-file-sync');

// ini ga dipake soalnya polybuild nya bermasalah sama js nya firebase
// gulp.task('build', function() {
// 	return gulp.src('index.html')
// 	.pipe(polybuild({maximumCrush: false, suffix: ''}))
// 	.pipe(gulp.dest('../cordova/www'))
// });

gulp.task('vulcanize', function() {
	return gulp.src('index.html')
	.pipe(vulcanize({
      stripComments: true,
      inlineScripts: true,
      inlineCss: true
    }))
	.pipe(crisper())
	.pipe(gulp.dest('../deposit-p2-www'));
});

gulp.task('cloneImages', function() {
	sync('img', '../deposit-p2-www/img', {recursive: false});
});

gulp.task('cloneManifest', function() {
	return gulp.src('manifest.json')
	.pipe(gulp.dest('../deposit-p2-www/'))
});

gulp.task('watch', function() {
	gulp.watch('bower_components/**/*.*', ['vulcanize']);
	gulp.watch('src/**/*.*', ['vulcanize']);
	gulp.watch('index.html', ['vulcanize']);
	gulp.watch('img/*.*', ['cloneImages']);
	gulp.watch('manifest.json', ['cloneManifest']);
});

gulp.task('runAll', ['vulcanize', 'cloneImages', 'cloneManifest']);

gulp.task('default', ['runAll', 'watch']);