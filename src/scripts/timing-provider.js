/* eslint-disable */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('babel-runtime/helpers/toConsumableArray'), require('babel-runtime/helpers/slicedToArray'), require('rxjs'), require('rxjs/operators'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('babel-runtime/regenerator'), require('babel-runtime/helpers/possibleConstructorReturn'), require('babel-runtime/helpers/inherits'), require('tslib'), require('./rxjs-connector'), require('rxjs-broker')) :
    typeof define === 'function' && define.amd ? define(['exports', 'babel-runtime/helpers/toConsumableArray', 'babel-runtime/helpers/slicedToArray', 'rxjs', 'rxjs/operators', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'babel-runtime/regenerator', 'babel-runtime/helpers/possibleConstructorReturn', 'babel-runtime/helpers/inherits', 'tslib', './rxjs-connector', 'rxjs-broker'], factory) :
    (factory((global.timingProvider = {}),global._toConsumableArray,global._slicedToArray,global.rxjs,global.operators,global._classCallCheck,global._createClass,global._regeneratorRuntime,global._possibleConstructorReturn,global._inherits,global.tslib_1,global.rxjsConnector,global.rxjsBroker));
}(this, (function (exports,_toConsumableArray,_slicedToArray,rxjs,operators,_classCallCheck,_createClass,_regeneratorRuntime,_possibleConstructorReturn,_inherits,tslib_1,rxjsConnector,rxjsBroker) { 'use strict';

    _toConsumableArray = _toConsumableArray && _toConsumableArray.hasOwnProperty('default') ? _toConsumableArray['default'] : _toConsumableArray;
    _slicedToArray = _slicedToArray && _slicedToArray.hasOwnProperty('default') ? _slicedToArray['default'] : _slicedToArray;
    _classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
    _createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
    _regeneratorRuntime = _regeneratorRuntime && _regeneratorRuntime.hasOwnProperty('default') ? _regeneratorRuntime['default'] : _regeneratorRuntime;
    _possibleConstructorReturn = _possibleConstructorReturn && _possibleConstructorReturn.hasOwnProperty('default') ? _possibleConstructorReturn['default'] : _possibleConstructorReturn;
    _inherits = _inherits && _inherits.hasOwnProperty('default') ? _inherits['default'] : _inherits;

    var estimatedOffset = function estimatedOffset(openedDataChannelSubjects) {
        return openedDataChannelSubjects.pipe(operators.mergeMap(function (dataChannelSubject) {
            var pingSubject = dataChannelSubject.mask({ action: 'ping' });
            var pongSubject = dataChannelSubject.mask({ action: 'pong' });
            // Respond to every ping event with the current value returned by performance.now().
            var pingSubjectSubscription = pingSubject.subscribe(function () {
                return pongSubject.send(performance.now());
            });
            return rxjs.zip(rxjs.interval(1000).pipe(operators.map(function () {
                // @todo It should be okay to send an empty message.
                pingSubject.send(undefined);
                return performance.now();
            })), pongSubject).pipe(operators.finalize(function () {
                return pingSubjectSubscription.unsubscribe();
            }), operators.map(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    pingTime = _ref2[0],
                    pongTime = _ref2[1];

                var now = performance.now();
                // This will compute the offset computed with the formula "remoteTime - localTime".
                return (pongTime * 2 - pingTime - now) / 2;
                // @todo Do fire an update event whenever the offset changes.
            }), operators.scan(function (latestValues, newValue) {
                return [].concat(_toConsumableArray(latestValues.slice(-4)), [newValue]);
            }, []), operators.map(function (values) {
                return values.reduce(function (sum, currentValue) {
                    return sum + currentValue;
                }, 0) / values.length;
            }));
        }));
    };

    // @todo This implementation is oversimplified and by far not complete.
    var EventTarget = function () {
        function EventTarget() {
            _classCallCheck(this, EventTarget);

            this._listeners = new Map();
        }

        _createClass(EventTarget, [{
            key: "addEventListener",
            value: function addEventListener(type, listener) {
                var listenersOfType = this._listeners.get(type);
                if (listenersOfType === undefined) {
                    this._listeners.set(type, new Set([listener]));
                } else {
                    listenersOfType.add(listener);
                }
            }
        }, {
            key: "dispatchEvent",
            value: function dispatchEvent(event) {
                var listenersOfType = this._listeners.get(event.type);
                if (listenersOfType !== undefined) {
                    listenersOfType.forEach(function (listener) {
                        return listener(event);
                    });
                }
                return false;
            }
        }, {
            key: "removeEventListener",
            value: function removeEventListener(type, listener) {
                var listenersOfType = this._listeners.get(type);
                if (listenersOfType !== undefined) {
                    if (listener === undefined) {
                        this._listeners.delete(type);
                    } else {
                        listenersOfType.delete(listener);
                    }
                }
            }
        }]);

        return EventTarget;
    }();

    var SUENC_URL = 'https://ssp88173c9.execute-api.eu-west-1.amazonaws.com/dev/';
    // @todo Use the public URL
    // const SUENC_URL = 'https://suenc.io/';
    var timingProviderConstructorFactory = function timingProviderConstructorFactory(estimatedOffset, fetch, performance, setTimeout) {
        return function (_EventTarget) {
            _inherits(TimingProvider, _EventTarget);

            function TimingProvider(providerId) {
                _classCallCheck(this, TimingProvider);

                var _this = _possibleConstructorReturn(this, (TimingProvider.__proto__ || Object.getPrototypeOf(TimingProvider)).call(this));

                _this._providerId = providerId;
                _this._readyState = 'connecting';
                _this._updateRequests = new rxjs.Subject();
                _this._createClient();
                return _this;
            }

            _createClass(TimingProvider, [{
                key: 'destroy',
                value: function destroy() {
                    var _this2 = this;

                    if (this._remoteUpdatesSubscription === null) {
                        throw new Error('The timingProvider is already destroyed.');
                    }
                    this._readyState = 'closed';
                    this._remoteUpdatesSubscription.unsubscribe();
                    this._updateRequests.complete();
                    setTimeout(function () {
                        return _this2.dispatchEvent(new Event('readystatechange'));
                    });
                }
            }, {
                key: 'update',
                value: function update(newVector) {
                    if (this._remoteUpdatesSubscription === null) {
                        return Promise.reject(new Error("The timingProvider is destroyed and can't be updated."));
                    }
                    this._updateRequests.next(newVector);
                    return Promise.resolve();
                }
            }, {
                key: '_createClient',
                value: function _createClient() {
                    return tslib_1.__awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
                        var _this3 = this;

                        var response, _ref, clientSocketUrl, closedDataChannels, openedDataChannels, openedDataChannelSubjects, currentlyOpenDataChannels, offsets;

                        return _regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        _context.next = 2;
                                        return fetch(SUENC_URL + 'providers/' + this._providerId + '/clients', { method: 'POST' });

                                    case 2:
                                        response = _context.sent;
                                        _context.next = 5;
                                        return response.json();

                                    case 5:
                                        _ref = _context.sent;
                                        clientSocketUrl = _ref.socket.url;

                                        // @todo Only set the the readyState to 'open' when there is no other client.
                                        this._readyState = 'open';
                                        setTimeout(function () {
                                            return _this3.dispatchEvent(new Event('readystatechange'));
                                        });
                                        closedDataChannels = new rxjs.Subject();
                                        openedDataChannels = rxjsConnector.accept(clientSocketUrl).pipe(operators.publish());
                                        openedDataChannelSubjects = openedDataChannels.pipe(operators.tap(function (dataChannel) {
                                            // @todo Ideally use something like the finally operator.
                                            var emitClosedDataChannel = function emitClosedDataChannel() {
                                                dataChannel.removeEventListener('close', emitClosedDataChannel);
                                                closedDataChannels.next(dataChannel);
                                            };
                                            dataChannel.addEventListener('close', emitClosedDataChannel);
                                        }), operators.map(function (dataChannel) {
                                            return rxjsBroker.wrap(dataChannel);
                                        }));
                                        currentlyOpenDataChannels = rxjs.merge(closedDataChannels, openedDataChannels).pipe(operators.scan(function (dataChannels, dataChannel) {
                                            var readyState = dataChannel.readyState;
                                            // DataChannels with a readyState of 'open' get appended to the array of DataChannels.

                                            if (readyState === 'open') {
                                                var index = dataChannels.findIndex(function (_ref2) {
                                                    var label = _ref2.label;
                                                    return label === dataChannel.label;
                                                });
                                                // In case there was already another channel with the same label, close it and replace it with the new one.
                                                if (index > -1) {
                                                    dataChannels[index].close();
                                                    return [].concat(_toConsumableArray(dataChannels.slice(0, index)), _toConsumableArray(dataChannels.slice(index + 1)), [dataChannel]);
                                                }
                                                return [].concat(_toConsumableArray(dataChannels), [dataChannel]);
                                            }
                                            // DataChannels with a readyState of 'closed' get removed from the array of DataChannels.
                                            if (readyState === 'closed') {
                                                var _index = dataChannels.indexOf(dataChannel);
                                                // In case the channel was replaced before it can't be detected by it's object identity anymore.
                                                if (_index === -1) {
                                                    return dataChannels;
                                                }
                                                return [].concat(_toConsumableArray(dataChannels.slice(0, _index)), _toConsumableArray(dataChannels.slice(_index + 1)));
                                            }
                                            throw new Error('The DataChannel has an unexpected readyState "' + readyState + '".');
                                        }, []));

                                        this._updateRequests.pipe(operators.withLatestFrom(currentlyOpenDataChannels)).subscribe(function (_ref3) {
                                            var _ref4 = _slicedToArray(_ref3, 2),
                                                vector = _ref4[0],
                                                dataChannels = _ref4[1];

                                            var timeStamp = performance.now();
                                            dataChannels.forEach(function (dataChannel) {
                                                dataChannel.send(JSON.stringify({ type: 'update', message: { timeStamp: timeStamp, vector: vector } }));
                                            });
                                            _this3._vector = vector;
                                            _this3.dispatchEvent(new CustomEvent('update', { detail: vector }));
                                        });
                                        offsets = estimatedOffset(openedDataChannelSubjects);

                                        this._remoteUpdatesSubscription = openedDataChannelSubjects.pipe(operators.mergeMap(function (dataChannelSubject) {
                                            return dataChannelSubject.mask({ type: 'update' });
                                        }), operators.withLatestFrom(offsets))
                                        // @todo Replace any with the actual type.
                                        .subscribe(function (_ref5) {
                                            var _ref6 = _slicedToArray(_ref5, 2),
                                                _ref6$ = _ref6[0],
                                                remoteTimeStamp = _ref6$.timeStamp,
                                                _ref6$$vector = _ref6$.vector,
                                                acceleration = _ref6$$vector.acceleration,
                                                position = _ref6$$vector.position,
                                                velocity = _ref6$$vector.velocity,
                                                offset = _ref6[1];

                                            // @todo Consider the acceleration as well.
                                            var now = performance.now();
                                            var desiredTimeStamp = remoteTimeStamp - offset;
                                            var normalizedPosition = position + (now - desiredTimeStamp) * velocity / 1000;
                                            // @todo Remove the type casting.
                                            var vector = { acceleration: acceleration, position: normalizedPosition, velocity: velocity };
                                            _this3._vector = vector;
                                            _this3.dispatchEvent(new CustomEvent('update', { detail: vector }));
                                        });
                                        openedDataChannels.connect();

                                    case 17:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, this);
                    }));
                }
            }, {
                key: 'endPosition',
                get: function get() {
                    return this._endPosition;
                }
            }, {
                key: 'error',
                get: function get() {
                    return this._error;
                }
            }, {
                key: 'onadjust',
                get: function get() {
                    return this._onadjust;
                }
            }, {
                key: 'onchange',
                get: function get() {
                    return this._onchange;
                }
            }, {
                key: 'onreadystatechange',
                get: function get() {
                    return this._onreadystatechange;
                }
            }, {
                key: 'readyState',
                get: function get() {
                    return this._readyState;
                }
            }, {
                key: 'skew',
                get: function get() {
                    return this._skew;
                }
            }, {
                key: 'startPosition',
                get: function get() {
                    return this._startPosition;
                }
            }, {
                key: 'vector',
                get: function get() {
                    return this._vector;
                }
            }]);

            return TimingProvider;
        }(EventTarget);
    };

    var timingProviderConstructor = timingProviderConstructorFactory(estimatedOffset, fetch, performance, setTimeout);
    // @todo Expose an isSupported flag which checks for fetch and performance.now() support.

    exports.TimingProvider = timingProviderConstructor;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
