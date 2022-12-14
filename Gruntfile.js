'use strict';

module.exports = function(grunt) {

    grunt.initConfig({

        packageJson: grunt.file.readJSON('package.json') || {},

        clean: {
            builds: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            'dist/*',
                            '!dist/.gitignore'
                        ]
                    }
                ]
            },
            test: {
                files: [
                    {
                        dot: true,
                        src: [
                            'coverage'
                        ]
                    }
                ]
            }
        },
        shell: {
            test: {
                options: {
                    stdout: true
                },
                command: function() {
                    return "NODE_ENV=test node node_modules/.bin/mocha \"test/**/*.js\"";
                }
            },
            testcoverage: {
                command: function() {
                    return "node test/api/testapi.js";
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: ['browser/phonix.js']
            }
        },
        uglify: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'browser/',
                        src: ['**/*.js'],
                        dest: 'dist/',
                        ext: '.min.js',
                        extDot: 'first'
                    }
                ]
            }
        },
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '/*! <%= packageJson.name %> v<%= packageJson.version %> | (c) <%= new Date() %> @virgel1995 | <%= packageJson.homepage %> */'
                },
                files: {
                    src: ['dist/phonix.min.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', [
        'clean:builds',
        'jshint',
        'uglify',
        'usebanner'
    ]);

    grunt.registerTask('test', [
        'shell:test'
    ]);

    grunt.registerTask('testcoverage', [
        'shell:testcoverage'
    ]);

};
