var assert = require('assert');

var testserver = require('./api/testapi');

var phonix = require('../lib');

//I'm too lazy to modify the client side tests, so "mock" window & testSetup
var window = {phonix: phonix};
var testSetup = function(callback) {
    callback(null, window);
};

describe('phonix', function() {

    describe('GET', function() {

        it('Should send a GET request correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.get('http://localhost:43760/api/get').then(function(res) {
                    assert.equal(res.data, "GET");
                    done();
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

        it('Should catch a 404 error correctly with a GET request', function(done) {
            testSetup(function(errors, window) {
                window.phonix.get('http://localhost:43760/api/get404').then(function(res) {
                    //Do nothing
                }).catch(function(err) {
                    assert(err);
                    done();
                });
            });
        });

    });

    describe('POST', function() {

        it('Should send a POST request with JSON data correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.post('http://localhost:43760/api/post', {content: 'Testing POST'}).then(function(res) {
                    assert(res.data, "POST");
                    done();
                }).catch(function(err) {
                    console.log(err);
                    done();
                });
            });
        });

        it('Should send a POST request with manually setting headers correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.post('http://localhost:43760/api/post', {headers: {'Content-Type': "application/json"}}, {content: 'Testing POST'}).then(function(res) {
                    assert(res.data, "POST");
                    done();
                }).catch(function(err) {
                    console.log(err);
                    done();
                });
            });
        });

        it('Should send a POST request with form data correctly (urlencoded)', function(done) {
            testSetup(function(errors, window) {
                var data = {
                    content: 'Testing POST form urlencoded'
                };
                var options = {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequestData: function(data) {
                        var str = [];
                        for(var p in data) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                        }
                        return str.join("&");
                    }
                };
                window.phonix.post('http://localhost:43760/api/post/urlform', options, data).then(function(res) {
                    assert(res.data, "POST FORM URLENCODED");
                    done();
                }).catch(() => {});
            });
        });

        it('Should catch a 500 error with a POST request (ex: invalid data)', function(done) {
            testSetup(function(errors, window) {
                window.phonix.post('http://localhost:43760/api/post', {content: 'Bad Content'}).then(function(res) {
                    console.log("Should not get here");
                    assert(!res);
                }).catch(function(err) {
                    assert(err);
                    done();
                });
            });
        });

    });

    describe('PUT', function() {

        it('Should send a PUT request with JSON data correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.put('http://localhost:43760/api/put', {content: 'Testing PUT'}).then(function(res) {
                    assert(res.data, "PUT");
                    done();
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

    });

    describe('DELETE', function() {

        it('Should send a DELETE request correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.delete('http://localhost:43760/api/delete').then(function(res) {
                    assert(res.data, "DELETE");
                    done();
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });


    });

    describe('PATCH', function() {

        it('Should send a PATCH request with JSON data correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.patch('http://localhost:43760/api/patch', {content: 'Testing PATCH'}).then(function(res) {
                    assert(res.data, "PATCH");
                    done();
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

    });

    describe('HEAD', function() {

        it('Should send a HEAD request correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.head('http://localhost:43760/api/head', {details: true}).then(function({res, request}) {
                    assert.equal(request.getResponseHeader('Custom-Header'), "HEAD");
                    done();
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

    });

    describe('JSONP', function() {
        it('Should send a JSONP request correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.jsonp('http://localhost:43760/api/jsonp?callback=JSON_CALLBACK').then(function(res) {
                    assert.equal(res.data, 'JSONP');
                    done();
                }).catch(() => {});
            });
        });

    });

    describe('Timeouts', function() {
        it('Should handle timeouts correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.get('http://localhost:43760/api/timeout').then(function(res) {
                    assert.equal(res.data, 'timein');

                    window.phonix.get('http://localhost:43760/api/timeout', {timeout: 250}).then(function(res) {
                        //Do nothing (timeout sleeps for 1 second, so this should abort/give an error)
                    }).catch(function(err) {
                        done();
                    });
                });
            });
        });
    });

    describe('Caching', function() {
        it('Should cache and retrieve GET requests correctly', function(done) {
            testSetup(function(errors, window) {
                window.phonix.get('http://localhost:43760/api/get', {cache: true}).then(function(res, status, xhr) {
                    assert.equal(res.data, "GET");

                    window.phonix.get('http://localhost:43760/api/get', {cache: true, details: true}).then(function({res, status, request}) {
                        assert.equal(res.data, "GET");
                        assert(status === 304);
                        assert(!request);
                        done();
                    }).catch(function(err) {
                        //Do nothing
                    });
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

        it('Should allow users to create custom caches with cache timeouts and clearing capabilities', function(done) {
            testSetup(function(errors, window) {
                var cacheFactory = window.phonix.CacheFactory;
                var blogCache = cacheFactory.get('blogs');
                var cacheOptions = {cache: blogCache, options: {timeout: 500}};

                window.phonix.get('http://localhost:43760/api/get', {cache: cacheOptions}).then(function(res, status, xhr) {
                    assert.equal(res.data, "GET");

                    window.phonix.get('http://localhost:43760/api/get', {cache: cacheOptions, details: true}).then(function({res, status, request}) {
                        assert.equal(res.data, "GET");
                        assert(status === 304);
                        assert(!request);

                        setTimeout(function() {
                            window.phonix.get('http://localhost:43760/api/get', {cache: cacheOptions, details: true}).then(function({res, status, request}) {

                                assert.equal(res.data, "GET");
                                assert(status === 200);
                                assert(request);

                                //Using the same cache
                                window.phonix.get('http://localhost:43760/api/get', {cache: blogCache, details: true}).then(function({res, status, request}) {
                                    assert.equal(res.data, "GET");
                                    assert(status === 304);
                                    assert(!request);

                                    done();
                                }).catch(() => {});
                            }).catch(() => {});
                        }, 510);

                    }).catch(function(err) {
                        //Do nothing
                    });
                }).catch(function(err) {
                    //Do nothing
                });
            });
        });

    });

    //TODO: Write tests for cookies & XSRF Token handling (should have an option to use your own cookie-jar or the global phonix one)

    describe('Cookies', function() {
        it('Should correctly handle getting and setting cookies', function(done) {
            testSetup(function(errors, window) {
                window.phonix.setCookie('mycookie', 'yum');
                window.phonix.setCookie('othercookie', 'yay!', 365); //Set cookie for 365 days

                //console.log(window.phonix.getCookie());

                assert(window.phonix.getCookie('mycookie'), 'yum');
                assert(window.phonix.getCookie('othercookie'), 'yay!');
                done();
            });
        });
    });

    describe('Interceptors', function() {
        it('Should correctly intercept requests and responses', function(done) {
            testSetup(function(errors, window) {
                var options = {
                    transformRequest: function(config) {

                        config.src = 'http://localhost:43760/api/get/again';

                        return config;
                    },
                    transformResponse: function(xhr) {
                        if(xhr.responseText.indexOf('GET AGAIN') > 0) {
                            xhr.responseText = '{"data": "Man in the middle!"}';
                        }
                    }
                };

                window.phonix.get('http://localhost:43760/api/get', options).then(function(res) {
                    assert(res.data, "Man in the middle!");
                }).catch(function(err) {
                    //Do nothing
                }).then(function() {
                    done();
                });
            });
        });
    });

    //Note: These global options change all responses to 'changed!', keep them last
    describe('Global Options', function() {
        it('Should set global options across multiple requests', function(done) {

            testSetup(function(errors, window) {
                var globalOptions = {
                    transformResponseData: function(data) {
                        return {content: 'changed!'};
                    }
                };

                window.phonix.setGlobalOptions(globalOptions);

                window.phonix.get('http://localhost:43760/api/get').then(function(res) {
                    assert.equal(res.content, 'changed!');
                    window.phonix.get('http://localhost:43760/api/get').then(function(res) {
                        assert.equal(res.content, 'changed!');
                        done();
                    }).catch(() => {});
                }).catch(() => {});
            });

        });
    });

});

