module.exports = {
    'build:development': [
        'clean',
        'htmlmin',
        'webpack',
        'postcss:development'
    ],
    'build:production': [
        'clean',
        'htmlmin',
        'webpack',
        'uglify',
        'postcss:production'
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
