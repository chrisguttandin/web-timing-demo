const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const stylelint = require('stylelint');
const stylelintConfigHolyGrail = require('stylelint-config-holy-grail');

module.exports = {
    development: {
        files: [ {
            cwd: 'src/styles/',
            dest: 'build/styles/',
            expand: true,
            src: [ 'styles.css' ]
        } ],
        options: {
            processors: [
                autoprefixer({
                    browsers: 'last 2 versions'
                })
            ]
        }
    },
    lint: {
        options: {
            processors: [
                // @todo This should use { extends: 'stylelint-config-holy-grail' } but that is not possible with grunt-postcss@0.8.0.
                stylelint(stylelintConfigHolyGrail)
            ],
            writeDest: false
        },
        src: [ 'src/**/*.css' ]
    },
    production: {
        files: [ {
            cwd: 'src/styles/',
            dest: 'build/styles/',
            expand: true,
            src: [ 'styles.css' ]
        } ],
        options: {
            processors: [
                autoprefixer({
                    browsers: 'last 2 versions'
                }),
                cssnano()
            ]
        }
    }
};
