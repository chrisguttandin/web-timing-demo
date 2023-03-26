module.exports = {
    'build:development': ['sh:clean', 'htmlmin', 'sh:build-development'],
    'build:production': ['sh:clean', 'htmlmin', 'sh:build-production'],
    'lint': ['sh:lint-config', 'sh:lint-src'],
    'monitor': ['build:development', 'connect', 'watch:development'],
    'preview': ['build:production', 'connect', 'watch:production'],
    'smoke': ['sh:hyperlink']
};
