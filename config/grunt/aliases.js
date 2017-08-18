module.exports = {
    'build:development': [
        'clean',
        'htmlmin',
        'webpack',
        'postcss:development',
        'copy:assets'
    ],
    'build:production': [
        'clean',
        'htmlmin',
        'webpack',
        'uglify',
        'postcss:production',
        'copy:assets'
    ],
    'deploy': [
        'build:production',
        'gh-pages:deploy'
    ],
    'deploy-on-version-updates': [
        'if:deploy'
    ],
    'lint': [
        'eslint',
        'htmlhint',
        'postcss:lint'
    ],
    'monitor': [
        'build:development',
        'connect',
        'watch:development'
    ],
    'preview': [
        'build:production',
        'connect',
        'watch:production'
    ]
};
