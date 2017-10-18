/* eslint-disable */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('core-js/es7/reflect'), require('@angular/core'), require('rxjs-broker'), require('babel-runtime/helpers/createClass'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/possibleConstructorReturn'), require('babel-runtime/helpers/inherits'), require('tslib'), require('rxjs/Observable'), require('rxjs/add/operator/mergeMap')) :
	typeof define === 'function' && define.amd ? define(['exports', 'core-js/es7/reflect', '@angular/core', 'rxjs-broker', 'babel-runtime/helpers/createClass', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/possibleConstructorReturn', 'babel-runtime/helpers/inherits', 'tslib', 'rxjs/Observable', 'rxjs/add/operator/mergeMap'], factory) :
	(factory((global.rxjsConnector = {}),null,global.core,global.rxjsBroker,global._createClass,global._classCallCheck,global._possibleConstructorReturn,global._inherits,global.tslib_1,global.Observable));
}(this, (function (exports,reflect,core,rxjsBroker,_createClass,_classCallCheck,_possibleConstructorReturn,_inherits,tslib_1,Observable) { 'use strict';

_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
_possibleConstructorReturn = _possibleConstructorReturn && _possibleConstructorReturn.hasOwnProperty('default') ? _possibleConstructorReturn['default'] : _possibleConstructorReturn;
_inherits = _inherits && _inherits.hasOwnProperty('default') ? _inherits['default'] : _inherits;

var awaitDataChannel = function awaitDataChannel(iceServers, webSocketSubject) {
    return new Observable.Observable(function (observer) {
        var peerConnection = new RTCPeerConnection({ iceServers: iceServers });
        var candidateChannel = webSocketSubject.mask({ type: 'candidate' });
        var descriptionChannel = webSocketSubject.mask({ type: 'description' });
        var candidateChannelSubscription = candidateChannel.subscribe(function (_ref) {
            var candidate = _ref.candidate;
            return peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(function () {
                // Errors can be ignored.
            });
        });
        var descriptionChannelSubscription = descriptionChannel.subscribe(function (_ref2) {
            var description = _ref2.description;

            peerConnection.setRemoteDescription(new RTCSessionDescription(description)).catch(function () {
                // @todo Handle this error and maybe request another description.
            });
            peerConnection.createAnswer().then(function (answer) {
                peerConnection.setLocalDescription(answer).catch(function () {
                    // @todo Handle this error and maybe create another description.
                });
                descriptionChannel.send({ description: answer });
            }).catch(function () {
                // @todo Handle this error and maybe create another answer.
            });
        });
        peerConnection.addEventListener('datachannel', function (_ref3) {
            var channel = _ref3.channel;

            candidateChannelSubscription.unsubscribe();
            descriptionChannelSubscription.unsubscribe();
            observer.next(channel);
            observer.complete();
        });
        peerConnection.addEventListener('icecandidate', function (_ref4) {
            var candidate = _ref4.candidate;

            if (candidate) {
                candidateChannel.send({ candidate: candidate });
            }
        });
        return function () {
            candidateChannelSubscription.unsubscribe();
            descriptionChannelSubscription.unsubscribe();
            // @todo Close the PeerConnection.
        };
    });
};

var createDataChannel = function createDataChannel(iceServers, label, webSocketSubject) {
    return new Observable.Observable(function (observer) {
        var peerConnection = new RTCPeerConnection({ iceServers: iceServers });
        // @todo Casting peerConnection to any should not be necessary forever.
        var dataChannel = peerConnection.createDataChannel(label, {
            ordered: true
        });
        var candidateSubject = webSocketSubject.mask({ type: 'candidate' });
        var descriptionSubject = webSocketSubject.mask({ type: 'description' });
        var candidateSubjectSubscription = candidateSubject.subscribe(function (_ref) {
            var candidate = _ref.candidate;
            return peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(function () {
                // Errors can be ignored.
            });
        });
        var descriptionSubjectSubscription = descriptionSubject.subscribe(function (_ref2) {
            var description = _ref2.description;
            return peerConnection.setRemoteDescription(new RTCSessionDescription(description)).catch(function () {
                // @todo Handle this error and maybe request another description.
            });
        });
        dataChannel.addEventListener('open', function () {
            candidateSubjectSubscription.unsubscribe();
            descriptionSubjectSubscription.unsubscribe();
            // Make sure to close the peerConnection when the DataChannel gets closed.
            dataChannel.addEventListener('close', function () {
                return peerConnection.close();
            });
            observer.next(dataChannel);
            observer.complete();
        });
        peerConnection.addEventListener('icecandidate', function (_ref3) {
            var candidate = _ref3.candidate;

            if (candidate) {
                candidateSubject.send({ candidate: candidate });
            }
        });
        peerConnection.addEventListener('negotiationneeded', function () {
            peerConnection.createOffer().then(function (description) {
                peerConnection.setLocalDescription(description).catch(function () {
                    // @todo Handle this error and maybe create another offer.
                });
                descriptionSubject.send({ description: description });
            }).catch(function () {
                // @todo Handle this error and maybe create another offer.
            });
        });
        return function () {
            candidateSubjectSubscription.unsubscribe();
            descriptionSubjectSubscription.unsubscribe();
            if (dataChannel.readyState === 'connecting') {
                peerConnection.close();
            }
        };
    });
};

var iceServers = new core.InjectionToken('ICE_SERVERS');
var ICE_SERVERS_PROVIDER = {
    provide: iceServers,
    useValue: [{
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:stun4.l.google.com:19302']
    }]
};

var DataChannelAcceptingObservable = function (_Observable) {
    _inherits(DataChannelAcceptingObservable, _Observable);

    function DataChannelAcceptingObservable(_ref) {
        var cSrvrs = _ref.iceServers,
            isActive = _ref.isActive,
            label = _ref.label,
            webSocketSubject = _ref.webSocketSubject;

        _classCallCheck(this, DataChannelAcceptingObservable);

        return _possibleConstructorReturn(this, (DataChannelAcceptingObservable.__proto__ || Object.getPrototypeOf(DataChannelAcceptingObservable)).call(this, function (observer) {
            if (isActive) {
                return createDataChannel(cSrvrs, label, webSocketSubject).subscribe(observer);
            }
            return awaitDataChannel(cSrvrs, webSocketSubject).subscribe(observer);
        }));
    }

    return DataChannelAcceptingObservable;
}(Observable.Observable);
var DataChannelAcceptingObservableFactory = function () {
    function DataChannelAcceptingObservableFactory(_iceServers) {
        _classCallCheck(this, DataChannelAcceptingObservableFactory);

        this._iceServers = _iceServers;
    }

    _createClass(DataChannelAcceptingObservableFactory, [{
        key: 'create',
        value: function create(_ref2) {
            var isActive = _ref2.isActive,
                label = _ref2.label,
                webSocketSubject = _ref2.webSocketSubject;

            return new DataChannelAcceptingObservable({ iceServers: this._iceServers, isActive: isActive, label: label, webSocketSubject: webSocketSubject });
        }
    }]);

    return DataChannelAcceptingObservableFactory;
}();
DataChannelAcceptingObservableFactory = tslib_1.__decorate([core.Injectable(), tslib_1.__param(0, core.Inject(iceServers)), tslib_1.__metadata("design:paramtypes", [Array])], DataChannelAcceptingObservableFactory);

var DataChannelRequestingObservable = function (_Observable) {
    _inherits(DataChannelRequestingObservable, _Observable);

    function DataChannelRequestingObservable(_ref) {
        var cSrvrs = _ref.iceServers,
            webSocketSubject = _ref.webSocketSubject;

        _classCallCheck(this, DataChannelRequestingObservable);

        var _this = _possibleConstructorReturn(this, (DataChannelRequestingObservable.__proto__ || Object.getPrototypeOf(DataChannelRequestingObservable)).call(this, function (observer) {
            return awaitDataChannel(cSrvrs, webSocketSubject).subscribe(observer);
        }));

        webSocketSubject.next({ type: 'request' });
        return _this;
    }

    return DataChannelRequestingObservable;
}(Observable.Observable);
var DataChannelRequestingObservableFactory = function () {
    function DataChannelRequestingObservableFactory(_iceServers) {
        _classCallCheck(this, DataChannelRequestingObservableFactory);

        this._iceServers = _iceServers;
    }

    _createClass(DataChannelRequestingObservableFactory, [{
        key: 'create',
        value: function create(_ref2) {
            var webSocketSubject = _ref2.webSocketSubject;

            return new DataChannelRequestingObservable({ iceServers: this._iceServers, webSocketSubject: webSocketSubject });
        }
    }]);

    return DataChannelRequestingObservableFactory;
}();
DataChannelRequestingObservableFactory = tslib_1.__decorate([core.Injectable(), tslib_1.__param(0, core.Inject(iceServers)), tslib_1.__metadata("design:paramtypes", [Array])], DataChannelRequestingObservableFactory);

var DataChannelsAcceptingObservable = function (_Observable) {
    _inherits(DataChannelsAcceptingObservable, _Observable);

    function DataChannelsAcceptingObservable(_ref) {
        var dataChannelAcceptingObservableFactory = _ref.dataChannelAcceptingObservableFactory,
            webSocketSubject = _ref.webSocketSubject;

        _classCallCheck(this, DataChannelsAcceptingObservable);

        return _possibleConstructorReturn(this, (DataChannelsAcceptingObservable.__proto__ || Object.getPrototypeOf(DataChannelsAcceptingObservable)).call(this, function (observer) {
            return webSocketSubject.mask({ type: 'request' }).mergeMap(function (_ref2) {
                var _ref2$isActive = _ref2.isActive,
                    isActive = _ref2$isActive === undefined ? true : _ref2$isActive,
                    _ref2$label = _ref2.label,
                    label = _ref2$label === undefined ? null : _ref2$label,
                    mask = _ref2.mask;
                return dataChannelAcceptingObservableFactory.create({
                    isActive: isActive,
                    label: label,
                    webSocketSubject: webSocketSubject.mask(mask)
                });
            }).subscribe(observer);
        }));
    }

    return DataChannelsAcceptingObservable;
}(Observable.Observable);
var DataChannelsAcceptingObservableFactory = function () {
    function DataChannelsAcceptingObservableFactory(_dataChannelAcceptingObservableFactory) {
        _classCallCheck(this, DataChannelsAcceptingObservableFactory);

        this._dataChannelAcceptingObservableFactory = _dataChannelAcceptingObservableFactory;
    }

    _createClass(DataChannelsAcceptingObservableFactory, [{
        key: 'create',
        value: function create(_ref3) {
            var webSocketSubject = _ref3.webSocketSubject;

            return new DataChannelsAcceptingObservable({
                dataChannelAcceptingObservableFactory: this._dataChannelAcceptingObservableFactory,
                webSocketSubject: webSocketSubject
            });
        }
    }]);

    return DataChannelsAcceptingObservableFactory;
}();
DataChannelsAcceptingObservableFactory = tslib_1.__decorate([core.Injectable(), tslib_1.__metadata("design:paramtypes", [DataChannelAcceptingObservableFactory])], DataChannelsAcceptingObservableFactory);

var injector = core.ReflectiveInjector.resolveAndCreate([DataChannelAcceptingObservableFactory, DataChannelRequestingObservableFactory, DataChannelsAcceptingObservableFactory, ICE_SERVERS_PROVIDER]);
var dataChannelsAcceptingObservableFactory = injector.get(DataChannelsAcceptingObservableFactory);
var dataChannelRequestingObservableFactory = injector.get(DataChannelRequestingObservableFactory);
var accept = function accept(url) {
    var webSocketSubject = rxjsBroker.connect(url);
    return dataChannelsAcceptingObservableFactory.create({ webSocketSubject: webSocketSubject });
};
var request = function request(url) {
    var webSocketSubject = rxjsBroker.connect(url);
    return dataChannelRequestingObservableFactory.create({ webSocketSubject: webSocketSubject });
};

exports.accept = accept;
exports.isSupported = rxjsBroker.isSupported;
exports.request = request;

Object.defineProperty(exports, '__esModule', { value: true });

})));
