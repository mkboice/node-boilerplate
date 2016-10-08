'use strict';

/* eslint-disable no-console */
const gulp = require('gulp');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const eslint = require('gulp-eslint');
const gulpNSP = require('gulp-nsp');
const checkDeps = require('gulp-check-deps');
const fs = require('fs-extra');
const semver = require('semver');
const argv = require('yargs').argv;
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const yaml = require('js-yaml');
const path = require('path');
const packageJson = require('./package.json');

const coverageThreshold = 20;

function isFixed(file) {
    // Has ESLint fixed the file contents?
    return file.eslint != null && file.eslint.fixed;
}

function getSwaggerDocPath() {
    return path.normalize('./api/swagger/swagger.yaml');
}

function getJSGlob() {
    return [
        '**/*.js',
        '!node_modules/**/*',
        '!coverage/**/*',
    ];
}

function getJSFiles() {
    return gulp.src(getJSGlob());
}

function getTestJSFiles() {
    return gulp.src([
        'test/**/*.js',
    ]);
}

function getCoverFiles() {
    return gulp.src([
        '**/*.js',
        '!node_modules/**/*',
        '!coverage/**/*',
        '!test/**/*',
        '!gulpfile.js',
    ]);
}

gulp.task('pre-test', () =>
    getCoverFiles()
    // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire())
);

gulp.task('test', ['pre-test'], () =>
   getTestJSFiles()
        .pipe(mocha())
);

// lint when any of the files change
gulp.task('test-watch', ['test'], () => {
    gulp.watch([getJSGlob()], ['test']);
});

// Run tests with coverage reports
gulp.task('test-cover', ['pre-test'], () =>
    getTestJSFiles()
        .pipe(mocha())
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports({ reporters: ['html', 'text', 'text-summary', 'json'] }))
        // Enforce a coverage of at least 90%
        .pipe(istanbul.enforceThresholds({ thresholds: { global: coverageThreshold } }))
        .once('error', () => {
            console.log(`Coverage Threshold (${coverageThreshold}) failed`);
            process.exit(1);
        })
);

// Run tests and coverage with the mocha-junit-reporter needed for circleci
gulp.task('test-cover-ci', ['pre-test'], () =>
    getTestJSFiles()
        .pipe(mocha({ reporter: 'mocha-junit-reporter' }))
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports({ reporters: ['html', 'text', 'text-summary', 'json'] }))
        // Enforce a coverage of at least 90%
        .pipe(istanbul.enforceThresholds({ thresholds: { global: coverageThreshold } }))
        .once('error', () => {
            console.log(`Coverage Threshold (${coverageThreshold}) failed`);
            process.exit(1);
        })
);

// lint when any of the files change
gulp.task('test-cover-watch', ['test-cover'], () => {
    gulp.watch([getJSGlob()], ['test-cover']);
});

// configure the lint task to fix issues that it can
gulp.task('lint-fix', () =>
    getJSFiles()
        .pipe(debug())
        .pipe(eslint({
            fix: true,
        }))
        .pipe(gulpIf(isFixed, gulp.dest('.')))
);

// configure the lint task
gulp.task('lint', () =>
    getJSFiles()
        .pipe(debug())
        .pipe(eslint())
        .pipe(eslint.format())
);

// lint when any of the files change
gulp.task('lint-watch', ['lint'], () => {
    gulp.watch([getJSGlob()], ['lint']);
});

// To check your project
gulp.task('nsp', (cb) => {
    gulpNSP({
        package: `${__dirname}/package.json`,
    }, cb);
});

gulp.task('check-deps', () =>
    gulp.src('package.json').pipe(checkDeps())
);

gulp.task('version-bump', () => {
    const oldVer = packageJson.version;
    const swaggerDoc = yaml.safeLoad(fs.readFileSync(getSwaggerDocPath(), 'utf8'));

    // --version
    // Sets the version to the provided value. Use with caution. Use the other options when possible.
    if (argv.version) {
        const validVersion = semver.valid(argv.version);
        if (validVersion !== null) {
            packageJson.version = validVersion;
        }
        else {
            console.log(`Version: ${argv.version} is invalid`);
            return;
        }
    }

    // --major
    else if (argv.major) {
        packageJson.version = semver.inc(oldVer, 'major');
    }

    // --minor
    else if (argv.minor) {
        packageJson.version = semver.inc(oldVer, 'minor');
    }

    // --patch
    else if (argv.patch || packageJson.version === oldVer) {
        packageJson.version = semver.inc(oldVer, 'patch');
    }

    swaggerDoc.info.version = packageJson.version;

    console.log(`Bumping package version: ${oldVer} ==> ${packageJson.version}`);
    fs.writeFileSync('./package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
    fs.writeFileSync(getSwaggerDocPath(), yaml.safeDump(swaggerDoc, { lineWidth: 120 }));
});
/* eslint-enable no-console */
