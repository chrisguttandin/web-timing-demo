const filter = (tasks) => tasks.filter((task) => task !== null);
const isVersionUpdate = (process.env.TRAVIS === 'true' &&
    process.env.TRAVIS_PULL_REQUEST === 'false' &&
    process.env.TRAVIS_SECURE_ENV_VARS === 'true' &&
    process.env.TRAVIS_TAG !== '');

module.exports = {
    'build:development': [
        'clean',
        'htmlmin',
        'webpack:development',
        'postcss:development'
    ],
    'build:production': [
        'clean',
        'htmlmin',
        'webpack:production',
        'postcss:production'
    ],
    'deploy': [
        'build:production',
        'gh-pages:deploy'
    ],
    'deploy-on-version-updates': filter([
        (isVersionUpdate) ? 'deploy' : null
    ]),
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
