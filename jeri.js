(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define("Jeri", ["react", "react-dom"], factory);
	else if(typeof exports === 'object')
		exports["Jeri"] = factory(require("react"), require("react-dom"));
	else
		root["Jeri"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_15__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Prototype identity matrix
var IDENTITY4x4 = new Float32Array(16);
for (var i = 0; i < 4; ++i) {
    IDENTITY4x4[i + 4 * i] = 1.0;
}
var Matrix4x4 = /** @class */ (function () {
    function Matrix4x4(buffer) {
        if (buffer === void 0) { buffer = IDENTITY4x4; }
        this.data = new Float32Array(buffer);
    }
    Matrix4x4.create = function () {
        return new Matrix4x4;
    };
    Matrix4x4.fromScaling = function (matrix, scaling) {
        if (scaling.length !== 3) {
            throw new Error('Matrix4x4.fromScaling requires a 3-dimentional vector as input');
        }
        scaling.forEach(function (scale, i) {
            matrix.data[i + 4 * i] = scale;
        });
    };
    Matrix4x4.multiply = function (output, a, b) {
        var data = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                for (var k = 0; k < 4; ++k) {
                    data[4 * j + i] += a.data[4 * k + i] * b.data[4 * j + k];
                }
            }
        }
        output.data = data;
    };
    Matrix4x4.scale = function (output, a, scale) {
        if (scale.length !== 3) {
            throw new Error('Matrix4x4.scale expects the third argument to have 3 numbers');
        }
        var data = new Float32Array(a.data);
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 4; ++j) {
                data[4 * i + j] *= scale[i];
            }
        }
        output.data = data;
    };
    Matrix4x4.translate = function (output, a, translation) {
        if (translation.length !== 3) {
            throw new Error('Matrix4x4.translate expects the third argument to have 3 numbers');
        }
        var data = new Float32Array(a.data);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 3; ++j) {
                data[12 + i] += a.data[4 * j + i] * translation[j];
            }
        }
        output.data = data;
    };
    Matrix4x4.clone = function (a) {
        return new Matrix4x4(a.data);
    };
    Matrix4x4.invert = function (output, matrix) {
        var m = matrix.data;
        var o = output.data;
        // tslint:disable:whitespace
        // tslint:disable:max-line-length
        o[0] = -m[7] * m[10] * m[13] + m[6] * m[11] * m[13] + m[7] * m[9] * m[14] - m[5] * m[11] * m[14] - m[6] * m[9] * m[15] + m[5] * m[10] * m[15];
        o[1] = m[3] * m[10] * m[13] - m[2] * m[11] * m[13] - m[3] * m[9] * m[14] + m[1] * m[11] * m[14] + m[2] * m[9] * m[15] - m[1] * m[10] * m[15];
        o[2] = -m[3] * m[6] * m[13] + m[2] * m[7] * m[13] + m[3] * m[5] * m[14] - m[1] * m[7] * m[14] - m[2] * m[5] * m[15] + m[1] * m[6] * m[15];
        o[3] = m[3] * m[6] * m[9] - m[2] * m[7] * m[9] - m[3] * m[5] * m[10] + m[1] * m[7] * m[10] + m[2] * m[5] * m[11] - m[1] * m[6] * m[11];
        o[4] = m[7] * m[10] * m[12] - m[6] * m[11] * m[12] - m[7] * m[8] * m[14] + m[4] * m[11] * m[14] + m[6] * m[8] * m[15] - m[4] * m[10] * m[15];
        o[5] = -m[3] * m[10] * m[12] + m[2] * m[11] * m[12] + m[3] * m[8] * m[14] - m[0] * m[11] * m[14] - m[2] * m[8] * m[15] + m[0] * m[10] * m[15];
        o[6] = m[3] * m[6] * m[12] - m[2] * m[7] * m[12] - m[3] * m[4] * m[14] + m[0] * m[7] * m[14] + m[2] * m[4] * m[15] - m[0] * m[6] * m[15];
        o[7] = -m[3] * m[6] * m[8] + m[2] * m[7] * m[8] + m[3] * m[4] * m[10] - m[0] * m[7] * m[10] - m[2] * m[4] * m[11] + m[0] * m[6] * m[11];
        o[8] = -m[7] * m[9] * m[12] + m[5] * m[11] * m[12] + m[7] * m[8] * m[13] - m[4] * m[11] * m[13] - m[5] * m[8] * m[15] + m[4] * m[9] * m[15];
        o[9] = m[3] * m[9] * m[12] - m[1] * m[11] * m[12] - m[3] * m[8] * m[13] + m[0] * m[11] * m[13] + m[1] * m[8] * m[15] - m[0] * m[9] * m[15];
        o[10] = -m[3] * m[5] * m[12] + m[1] * m[7] * m[12] + m[3] * m[4] * m[13] - m[0] * m[7] * m[13] - m[1] * m[4] * m[15] + m[0] * m[5] * m[15];
        o[11] = m[3] * m[5] * m[8] - m[1] * m[7] * m[8] - m[3] * m[4] * m[9] + m[0] * m[7] * m[9] + m[1] * m[4] * m[11] - m[0] * m[5] * m[11];
        o[12] = m[6] * m[9] * m[12] - m[5] * m[10] * m[12] - m[6] * m[8] * m[13] + m[4] * m[10] * m[13] + m[5] * m[8] * m[14] - m[4] * m[9] * m[14];
        o[13] = -m[2] * m[9] * m[12] + m[1] * m[10] * m[12] + m[2] * m[8] * m[13] - m[0] * m[10] * m[13] - m[1] * m[8] * m[14] + m[0] * m[9] * m[14];
        o[14] = m[2] * m[5] * m[12] - m[1] * m[6] * m[12] - m[2] * m[4] * m[13] + m[0] * m[6] * m[13] + m[1] * m[4] * m[14] - m[0] * m[5] * m[14];
        o[15] = -m[2] * m[5] * m[8] + m[1] * m[6] * m[8] + m[2] * m[4] * m[9] - m[0] * m[6] * m[9] - m[1] * m[4] * m[10] + m[0] * m[5] * m[10];
        // tslint:enable:whitespace
        // tslint:enable:max-line-length
        var determinant = m[0] * o[0] + m[1] * o[4] + m[2] * o[8] + m[3] * o[12];
        if (determinant === 0.0) {
            throw new Error('Matrix is not invertible.');
        }
        var inverseDeterminant = 1.0 / determinant;
        for (var i = 0; i < 16; ++i) {
            o[i] *= inverseDeterminant;
        }
    };
    return Matrix4x4;
}());
exports.Matrix4x4 = Matrix4x4;
var Vector4 = /** @class */ (function () {
    function Vector4() {
        this.data = new Float32Array([0, 0, 0, 0]);
    }
    Vector4.create = function () {
        return new Vector4;
    };
    Vector4.set = function (output, x, y, z, w) {
        output.data[0] = x;
        output.data[1] = y;
        output.data[2] = z;
        output.data[3] = w;
    };
    Vector4.fromValues = function (x, y, z, w) {
        var vector = new Vector4;
        Vector4.set(vector, x, y, z, w);
        return vector;
    };
    Vector4.transformMat4 = function (output, vector, matrix) {
        var v = vector.data;
        var m = matrix.data;
        var data = new Float32Array([0, 0, 0, 0]);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                data[i] += v[j] * m[4 * j + i];
            }
        }
        output.data = data;
    };
    return Vector4;
}());
exports.Vector4 = Vector4;
// function assertEqual(a: mat4 | vec4, b: Matrix4x4 | Vector4, message: string): void {
//     for (let i = 0; i < a.length; ++i) {
//         if (Math.abs(a[i] - b.data[i]) > 0.001) {
//             throw new Error('Failed:' + message + '\n' + a + '\n' + b.data);
//         }
//     }
// }
// function test() {
//     const a = mat4.create();
//     const b = Matrix4x4.create();
//     assertEqual(a, b, 'after creation');
//     for (let ii = 0; ii < 16; ++ii) {
//         a[ii] = b.data[ii] = Math.random();
//     }
//     const c = mat4.create();
//     const d = Matrix4x4.create();
//     mat4.fromScaling(c, [4, 3, 2]);
//     Matrix4x4.fromScaling(d, [4, 3, 2]);
//     assertEqual(c, d, 'fromScaling');
//     mat4.translate(c, a, [2, 3, 4]);
//     Matrix4x4.translate(d, b, [2, 3, 4]);
//     // assertEqual(a, b, 'after translation ab');
//     assertEqual(c, d, 'after translation cd');
//     mat4.scale(a, c, [2, 3, 4]);
//     Matrix4x4.scale(b, d, [2, 3, 4]);
//     assertEqual(a, b, 'after scaling ab');
//     // assertEqual(c, d, 'after scaling cd');
//     mat4.translate(c, a, [2, 3, 4]);
//     Matrix4x4.translate(d, b, [2, 3, 4]);
//     // assertEqual(a, b, 'after translation again ab');
//     assertEqual(c, d, 'after translation again cd');
//     mat4.invert(a, c);
//     Matrix4x4.invert(b, d);
//     assertEqual(a, b, 'after invert ab');
//     assertEqual(c, d, 'after invert cd');
//     const e = mat4.create();
//     const f = Matrix4x4.create();
//     mat4.multiply(e, c, a);
//     Matrix4x4.multiply(f, d, b);
//     assertEqual(e, f, 'after multiply ef');
//     assertEqual(c, d, 'after multiply cd');
//     assertEqual(a, b, 'after multiply ab');
//     mat4.scale(a, c, [5, -3, 4]);
//     Matrix4x4.scale(b, d, [5, -3, 4]);
//     assertEqual(a, b, 'after scaling again ab');
//     assertEqual(c, d, 'after scaling again cd');
//     // assertEqual(c, d, 'after scaling cd');
//     const q = mat4.clone(a);
//     const i = Matrix4x4.clone(b);
//     assertEqual(q, i, 'after cloning');
//     const v1 = vec4.create();
//     const w1 = Vector4.create();
//     assertEqual(v1, w1, 'vectors after init');
//     vec4.set(v1, 3, 4, 5, 6);
//     Vector4.set(w1, 3, 4, 5, 6);
//     assertEqual(v1, w1, 'vectors after set');
//     const v2 = vec4.fromValues(6, 5, 4, 3);
//     const w2 = Vector4.fromValues(6, 5, 4, 3);
//     assertEqual(v2, w2, 'vectors after fromValues');
//     vec4.transformMat4(v1, v2, a);
//     Vector4.transformMat4(w1, w2, b);
//     assertEqual(v1, w1, 'vectors after tranformMat4');
// }


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "css", function() { return css; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyframes", function() { return keyframes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "injectGlobal", function() { return injectGlobal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemeProvider", function() { return ThemeProvider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "withTheme", function() { return wrapWithTheme; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServerStyleSheet", function() { return ServerStyleSheet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StyleSheetManager", function() { return StyleSheetManager; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_is_plain_object__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_is_plain_object___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_is_plain_object__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_stylis__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_stylis___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_stylis__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_is_function__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_is_function___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_is_function__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics__);







/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate$2(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

var hyphenate_1 = hyphenate$2;

var hyphenate = hyphenate_1;

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

var hyphenateStyleName_1 = hyphenateStyleName;

//      
var objToCss = function objToCss(obj, prevKey) {
  var css = Object.keys(obj).filter(function (key) {
    var chunk = obj[key];
    return chunk !== undefined && chunk !== null && chunk !== false && chunk !== '';
  }).map(function (key) {
    if (__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(obj[key])) return objToCss(obj[key], key);
    return hyphenateStyleName_1(key) + ': ' + obj[key] + ';';
  }).join(' ');
  return prevKey ? prevKey + ' {\n  ' + css + '\n}' : css;
};

var flatten = function flatten(chunks, executionContext) {
  return chunks.reduce(function (ruleSet, chunk) {
    /* Remove falsey values */
    if (chunk === undefined || chunk === null || chunk === false || chunk === '') return ruleSet;
    /* Flatten ruleSet */
    if (Array.isArray(chunk)) return [].concat(ruleSet, flatten(chunk, executionContext));

    /* Handle other components */
    // $FlowFixMe not sure how to make this pass
    if (chunk.hasOwnProperty('styledComponentId')) return [].concat(ruleSet, ['.' + chunk.styledComponentId]);

    /* Either execute or defer the function */
    if (typeof chunk === 'function') {
      return executionContext ? ruleSet.concat.apply(ruleSet, flatten([chunk(executionContext)], executionContext)) : ruleSet.concat(chunk);
    }

    /* Handle objects */
    // $FlowFixMe have to add %checks somehow to isPlainObject
    return ruleSet.concat(__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(chunk) ? objToCss(chunk) : chunk.toString());
  }, []);
};

//      
var stylis = new __WEBPACK_IMPORTED_MODULE_1_stylis___default.a({
  global: false,
  cascade: true,
  keyframe: false,
  prefix: true,
  compress: false,
  semicolon: true
});

var stringifyRules = function stringifyRules(rules, selector, prefix) {
  var flatCSS = rules.join('').replace(/^\s*\/\/.*$/gm, ''); // replace JS comments

  var cssStr = selector && prefix ? prefix + ' ' + selector + ' { ' + flatCSS + ' }' : flatCSS;

  return stylis(prefix || !selector ? '' : selector, cssStr);
};

//      
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var charsLength = chars.length;

/* Some high number, usually 9-digit base-10. Map it to base-😎 */
var generateAlphabeticName = function generateAlphabeticName(code) {
  var name = '';
  var x = void 0;

  for (x = code; x > charsLength; x = Math.floor(x / charsLength)) {
    name = chars[x % charsLength] + name;
  }

  return chars[x % charsLength] + name;
};

//      


var interleave = (function (strings, interpolations) {
  return interpolations.reduce(function (array, interp, i) {
    return array.concat(interp, strings[i + 1]);
  }, [strings[0]]);
});

//      
var css = (function (strings) {
  for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    interpolations[_key - 1] = arguments[_key];
  }

  return flatten(interleave(strings, interpolations));
});

//      
var SC_COMPONENT_ID = /^[^\S\n]*?\/\* sc-component-id:\s+(\S+)\s+\*\//mg;

var extractCompsFromCSS = (function (maybeCSS) {
  var css = '' + (maybeCSS || ''); // Definitely a string, and a clone
  var existingComponents = [];
  css.replace(SC_COMPONENT_ID, function (match, componentId, matchIndex) {
    existingComponents.push({ componentId: componentId, matchIndex: matchIndex });
    return match;
  });
  return existingComponents.map(function (_ref, i) {
    var componentId = _ref.componentId,
        matchIndex = _ref.matchIndex;

    var nextComp = existingComponents[i + 1];
    var cssFromDOM = nextComp ? css.slice(matchIndex, nextComp.matchIndex) : css.slice(matchIndex);
    return { componentId: componentId, cssFromDOM: cssFromDOM };
  });
});

//      
/* eslint-disable camelcase, no-undef */

var getNonce = (function () {
                                     return  true ? __webpack_require__.nc : null;
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

//      
/* eslint-disable no-underscore-dangle */
/*
 * Browser Style Sheet with Rehydration
 *
 * <style data-styled-components="x y z"
 *        data-styled-components-is-local="true">
 *   /· sc-component-id: a ·/
 *   .sc-a { ... }
 *   .x { ... }
 *   /· sc-component-id: b ·/
 *   .sc-b { ... }
 *   .y { ... }
 *   .z { ... }
 * </style>
 *
 * Note: replace · with * in the above snippet.
 * */
var COMPONENTS_PER_TAG = 40;

var BrowserTag = function () {
  function BrowserTag(el, isLocal) {
    var existingSource = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    classCallCheck(this, BrowserTag);

    this.el = el;
    this.isLocal = isLocal;
    this.ready = false;

    var extractedComps = extractCompsFromCSS(existingSource);

    this.size = extractedComps.length;
    this.components = extractedComps.reduce(function (acc, obj) {
      acc[obj.componentId] = obj; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  }

  BrowserTag.prototype.isFull = function isFull() {
    return this.size >= COMPONENTS_PER_TAG;
  };

  BrowserTag.prototype.addComponent = function addComponent(componentId) {
    if (!this.ready) this.replaceElement();
    if (this.components[componentId]) throw new Error('Trying to add Component \'' + componentId + '\' twice!');

    var comp = { componentId: componentId, textNode: document.createTextNode('') };
    this.el.appendChild(comp.textNode);

    this.size += 1;
    this.components[componentId] = comp;
  };

  BrowserTag.prototype.inject = function inject(componentId, css, name) {
    if (!this.ready) this.replaceElement();
    var comp = this.components[componentId];

    if (!comp) throw new Error('Must add a new component before you can inject css into it');
    if (comp.textNode.data === '') comp.textNode.appendData('\n/* sc-component-id: ' + componentId + ' */\n');

    comp.textNode.appendData(css);
    if (name) {
      var existingNames = this.el.getAttribute(SC_ATTR);
      this.el.setAttribute(SC_ATTR, existingNames ? existingNames + ' ' + name : name);
    }

    var nonce = getNonce();

    if (nonce) {
      this.el.setAttribute('nonce', nonce);
    }
  };

  BrowserTag.prototype.toHTML = function toHTML() {
    return this.el.outerHTML;
  };

  BrowserTag.prototype.toReactElement = function toReactElement() {
    throw new Error('BrowserTag doesn\'t implement toReactElement!');
  };

  BrowserTag.prototype.clone = function clone() {
    throw new Error('BrowserTag cannot be cloned!');
  };

  /* Because we care about source order, before we can inject anything we need to
   * create a text node for each component and replace the existing CSS. */


  BrowserTag.prototype.replaceElement = function replaceElement() {
    var _this = this;

    this.ready = true;
    // We have nothing to inject. Use the current el.
    if (this.size === 0) return;

    // Build up our replacement style tag
    var newEl = this.el.cloneNode();
    newEl.appendChild(document.createTextNode('\n'));

    Object.keys(this.components).forEach(function (key) {
      var comp = _this.components[key];

      // eslint-disable-next-line no-param-reassign
      comp.textNode = document.createTextNode(comp.cssFromDOM);
      newEl.appendChild(comp.textNode);
    });

    if (!this.el.parentNode) throw new Error("Trying to replace an element that wasn't mounted!");

    // The ol' switcheroo
    this.el.parentNode.replaceChild(newEl, this.el);
    this.el = newEl;
  };

  return BrowserTag;
}();

/* Factory function to separate DOM operations from logical ones*/


var BrowserStyleSheet = {
  create: function create() {
    var tags = [];
    var names = {};

    /* Construct existing state from DOM */
    var nodes = document.querySelectorAll('[' + SC_ATTR + ']');
    var nodesLength = nodes.length;

    for (var i = 0; i < nodesLength; i += 1) {
      var el = nodes[i];

      tags.push(new BrowserTag(el, el.getAttribute(LOCAL_ATTR) === 'true', el.innerHTML));

      var attr = el.getAttribute(SC_ATTR);
      if (attr) {
        attr.trim().split(/\s+/).forEach(function (name) {
          names[name] = true;
        });
      }
    }

    /* Factory for making more tags */
    var tagConstructor = function tagConstructor(isLocal) {
      var el = document.createElement('style');
      el.type = 'text/css';
      el.setAttribute(SC_ATTR, '');
      el.setAttribute(LOCAL_ATTR, isLocal ? 'true' : 'false');
      if (!document.head) throw new Error('Missing document <head>');
      document.head.appendChild(el);
      return new BrowserTag(el, isLocal);
    };

    return new StyleSheet(tagConstructor, tags, names);
  }
};

//      
var SC_ATTR = 'data-styled-components';
var LOCAL_ATTR = 'data-styled-components-is-local';
var CONTEXT_KEY = '__styled-components-stylesheet__';

var instance = null;
// eslint-disable-next-line no-use-before-define
var clones = [];

var StyleSheet = function () {
  function StyleSheet(tagConstructor) {
    var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var names = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, StyleSheet);
    this.hashes = {};
    this.deferredInjections = {};
    this.stylesCacheable = typeof document !== 'undefined';

    this.tagConstructor = tagConstructor;
    this.tags = tags;
    this.names = names;
    this.constructComponentTagMap();
  }

  // helper for `ComponentStyle` to know when it cache static styles.
  // staticly styled-component can not safely cache styles on the server
  // without all `ComponentStyle` instances saving a reference to the
  // the styleSheet instance they last rendered with,
  // or listening to creation / reset events. otherwise you might create
  // a component with one stylesheet and render it another api response
  // with another, losing styles on from your server-side render.


  StyleSheet.prototype.constructComponentTagMap = function constructComponentTagMap() {
    var _this = this;

    this.componentTags = {};

    this.tags.forEach(function (tag) {
      Object.keys(tag.components).forEach(function (componentId) {
        _this.componentTags[componentId] = tag;
      });
    });
  };

  /* Best level of caching—get the name from the hash straight away. */


  StyleSheet.prototype.getName = function getName(hash) {
    return this.hashes[hash.toString()];
  };

  /* Second level of caching—if the name is already in the dom, don't
   * inject anything and record the hash for getName next time. */


  StyleSheet.prototype.alreadyInjected = function alreadyInjected(hash, name) {
    if (!this.names[name]) return false;

    this.hashes[hash.toString()] = name;
    return true;
  };

  /* Third type of caching—don't inject components' componentId twice. */


  StyleSheet.prototype.hasInjectedComponent = function hasInjectedComponent(componentId) {
    return !!this.componentTags[componentId];
  };

  StyleSheet.prototype.deferredInject = function deferredInject(componentId, isLocal, css) {
    if (this === instance) {
      clones.forEach(function (clone) {
        clone.deferredInject(componentId, isLocal, css);
      });
    }

    this.getOrCreateTag(componentId, isLocal);
    this.deferredInjections[componentId] = css;
  };

  StyleSheet.prototype.inject = function inject(componentId, isLocal, css, hash, name) {
    if (this === instance) {
      clones.forEach(function (clone) {
        clone.inject(componentId, isLocal, css);
      });
    }

    var tag = this.getOrCreateTag(componentId, isLocal);

    var deferredInjection = this.deferredInjections[componentId];
    if (deferredInjection) {
      tag.inject(componentId, deferredInjection);
      delete this.deferredInjections[componentId];
    }

    tag.inject(componentId, css, name);

    if (hash && name) {
      this.hashes[hash.toString()] = name;
    }
  };

  StyleSheet.prototype.toHTML = function toHTML() {
    return this.tags.map(function (tag) {
      return tag.toHTML();
    }).join('');
  };

  StyleSheet.prototype.toReactElements = function toReactElements() {
    return this.tags.map(function (tag, i) {
      return tag.toReactElement('sc-' + i);
    });
  };

  StyleSheet.prototype.getOrCreateTag = function getOrCreateTag(componentId, isLocal) {
    var existingTag = this.componentTags[componentId];
    if (existingTag) {
      return existingTag;
    }

    var lastTag = this.tags[this.tags.length - 1];
    var componentTag = !lastTag || lastTag.isFull() || lastTag.isLocal !== isLocal ? this.createNewTag(isLocal) : lastTag;
    this.componentTags[componentId] = componentTag;
    componentTag.addComponent(componentId);
    return componentTag;
  };

  StyleSheet.prototype.createNewTag = function createNewTag(isLocal) {
    var newTag = this.tagConstructor(isLocal);
    this.tags.push(newTag);
    return newTag;
  };

  StyleSheet.reset = function reset(isServer) {
    instance = StyleSheet.create(isServer);
  };

  /* We can make isServer totally implicit once Jest 20 drops and we
   * can change environment on a per-test basis. */


  StyleSheet.create = function create() {
    var isServer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : typeof document === 'undefined';

    return (isServer ? ServerStyleSheet : BrowserStyleSheet).create();
  };

  StyleSheet.clone = function clone(oldSheet) {
    var newSheet = new StyleSheet(oldSheet.tagConstructor, oldSheet.tags.map(function (tag) {
      return tag.clone();
    }), _extends({}, oldSheet.names));

    newSheet.hashes = _extends({}, oldSheet.hashes);
    newSheet.deferredInjections = _extends({}, oldSheet.deferredInjections);
    clones.push(newSheet);

    return newSheet;
  };

  createClass(StyleSheet, null, [{
    key: 'instance',
    get: function get$$1() {
      return instance || (instance = StyleSheet.create());
    }
  }]);
  return StyleSheet;
}();

var _StyleSheetManager$ch;

//      
var StyleSheetManager = function (_Component) {
  inherits(StyleSheetManager, _Component);

  function StyleSheetManager() {
    classCallCheck(this, StyleSheetManager);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  StyleSheetManager.prototype.getChildContext = function getChildContext() {
    var _ref;

    return _ref = {}, _ref[CONTEXT_KEY] = this.props.sheet, _ref;
  };

  StyleSheetManager.prototype.render = function render() {
    /* eslint-disable react/prop-types */
    // Flow v0.43.1 will report an error accessing the `children` property,
    // but v0.47.0 will not. It is necessary to use a type cast instead of
    // a "fixme" comment to satisfy both Flow versions.
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.Children.only(this.props.children);
  };

  return StyleSheetManager;
}(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

StyleSheetManager.childContextTypes = (_StyleSheetManager$ch = {}, _StyleSheetManager$ch[CONTEXT_KEY] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet), __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(ServerStyleSheet)]).isRequired, _StyleSheetManager$ch);

StyleSheetManager.propTypes = {
  sheet: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet), __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(ServerStyleSheet)]).isRequired
};

//      
/* eslint-disable no-underscore-dangle */
var ServerTag = function () {
  function ServerTag(isLocal) {
    classCallCheck(this, ServerTag);

    this.isLocal = isLocal;
    this.components = {};
    this.size = 0;
    this.names = [];
  }

  ServerTag.prototype.isFull = function isFull() {
    return false;
  };

  ServerTag.prototype.addComponent = function addComponent(componentId) {
    if (this.components[componentId]) throw new Error('Trying to add Component \'' + componentId + '\' twice!');
    this.components[componentId] = { componentId: componentId, css: '' };
    this.size += 1;
  };

  ServerTag.prototype.concatenateCSS = function concatenateCSS() {
    var _this = this;

    return Object.keys(this.components).reduce(function (styles, k) {
      return styles + _this.components[k].css;
    }, '');
  };

  ServerTag.prototype.inject = function inject(componentId, css, name) {
    var comp = this.components[componentId];

    if (!comp) throw new Error('Must add a new component before you can inject css into it');
    if (comp.css === '') comp.css = '/* sc-component-id: ' + componentId + ' */\n';

    comp.css += css.replace(/\n*$/, '\n');

    if (name) this.names.push(name);
  };

  ServerTag.prototype.toHTML = function toHTML() {
    var attrs = ['type="text/css"', SC_ATTR + '="' + this.names.join(' ') + '"', LOCAL_ATTR + '="' + (this.isLocal ? 'true' : 'false') + '"'];

    var nonce = getNonce();

    if (nonce) {
      attrs.push('nonce="' + nonce + '"');
    }

    return '<style ' + attrs.join(' ') + '>' + this.concatenateCSS() + '</style>';
  };

  ServerTag.prototype.toReactElement = function toReactElement(key) {
    var _attrs;

    var attrs = (_attrs = {}, _attrs[SC_ATTR] = this.names.join(' '), _attrs[LOCAL_ATTR] = this.isLocal.toString(), _attrs);

    var nonce = getNonce();

    if (nonce) {
      attrs.nonce = nonce;
    }

    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement('style', _extends({
      key: key, type: 'text/css' }, attrs, {
      dangerouslySetInnerHTML: { __html: this.concatenateCSS() }
    }));
  };

  ServerTag.prototype.clone = function clone() {
    var _this2 = this;

    var copy = new ServerTag(this.isLocal);
    copy.names = [].concat(this.names);
    copy.size = this.size;
    copy.components = Object.keys(this.components).reduce(function (acc, key) {
      acc[key] = _extends({}, _this2.components[key]); // eslint-disable-line no-param-reassign
      return acc;
    }, {});

    return copy;
  };

  return ServerTag;
}();

var ServerStyleSheet = function () {
  function ServerStyleSheet() {
    classCallCheck(this, ServerStyleSheet);

    this.instance = StyleSheet.clone(StyleSheet.instance);
  }

  ServerStyleSheet.prototype.collectStyles = function collectStyles(children) {
    if (this.closed) throw new Error("Can't collect styles once you've called getStyleTags!");
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement(
      StyleSheetManager,
      { sheet: this.instance },
      children
    );
  };

  ServerStyleSheet.prototype.getStyleTags = function getStyleTags() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toHTML();
  };

  ServerStyleSheet.prototype.getStyleElement = function getStyleElement() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toReactElements();
  };

  ServerStyleSheet.create = function create() {
    return new StyleSheet(function (isLocal) {
      return new ServerTag(isLocal);
    });
  };

  return ServerStyleSheet;
}();

//      

var LIMIT = 200;

var createWarnTooManyClasses = (function (displayName) {
  var generatedClasses = {};
  var warningSeen = false;

  return function (className) {
    if (!warningSeen) {
      generatedClasses[className] = true;
      if (Object.keys(generatedClasses).length >= LIMIT) {
        // Unable to find latestRule in test environment.
        /* eslint-disable no-console, prefer-template */
        console.warn('Over ' + LIMIT + ' classes were generated for component ' + displayName + '. \n' + 'Consider using the attrs method, together with a style object for frequently changed styles.\n' + 'Example:\n' + '  const Component = styled.div.attrs({\n' + '    style: ({ background }) => ({\n' + '      background,\n' + '    }),\n' + '  })`width: 100%;`\n\n' + '  <Component />');
        warningSeen = true;
        generatedClasses = {};
      }
    }
  };
});

//      
/* Trying to avoid the unknown-prop errors on styled components
 by filtering by React's attribute whitelist.
 */

/* Logic copied from ReactDOMUnknownPropertyHook */
var reactProps = {
  children: true,
  dangerouslySetInnerHTML: true,
  key: true,
  ref: true,
  autoFocus: true,
  defaultValue: true,
  valueLink: true,
  defaultChecked: true,
  checkedLink: true,
  innerHTML: true,
  suppressContentEditableWarning: true,
  onFocusIn: true,
  onFocusOut: true,
  className: true,

  /* List copied from https://facebook.github.io/react/docs/events.html */
  onCopy: true,
  onCut: true,
  onPaste: true,
  onCompositionEnd: true,
  onCompositionStart: true,
  onCompositionUpdate: true,
  onKeyDown: true,
  onKeyPress: true,
  onKeyUp: true,
  onFocus: true,
  onBlur: true,
  onChange: true,
  onInput: true,
  onSubmit: true,
  onReset: true,
  onClick: true,
  onContextMenu: true,
  onDoubleClick: true,
  onDrag: true,
  onDragEnd: true,
  onDragEnter: true,
  onDragExit: true,
  onDragLeave: true,
  onDragOver: true,
  onDragStart: true,
  onDrop: true,
  onMouseDown: true,
  onMouseEnter: true,
  onMouseLeave: true,
  onMouseMove: true,
  onMouseOut: true,
  onMouseOver: true,
  onMouseUp: true,
  onSelect: true,
  onTouchCancel: true,
  onTouchEnd: true,
  onTouchMove: true,
  onTouchStart: true,
  onScroll: true,
  onWheel: true,
  onAbort: true,
  onCanPlay: true,
  onCanPlayThrough: true,
  onDurationChange: true,
  onEmptied: true,
  onEncrypted: true,
  onEnded: true,
  onError: true,
  onLoadedData: true,
  onLoadedMetadata: true,
  onLoadStart: true,
  onPause: true,
  onPlay: true,
  onPlaying: true,
  onProgress: true,
  onRateChange: true,
  onSeeked: true,
  onSeeking: true,
  onStalled: true,
  onSuspend: true,
  onTimeUpdate: true,
  onVolumeChange: true,
  onWaiting: true,
  onLoad: true,
  onAnimationStart: true,
  onAnimationEnd: true,
  onAnimationIteration: true,
  onTransitionEnd: true,

  onCopyCapture: true,
  onCutCapture: true,
  onPasteCapture: true,
  onCompositionEndCapture: true,
  onCompositionStartCapture: true,
  onCompositionUpdateCapture: true,
  onKeyDownCapture: true,
  onKeyPressCapture: true,
  onKeyUpCapture: true,
  onFocusCapture: true,
  onBlurCapture: true,
  onChangeCapture: true,
  onInputCapture: true,
  onSubmitCapture: true,
  onResetCapture: true,
  onClickCapture: true,
  onContextMenuCapture: true,
  onDoubleClickCapture: true,
  onDragCapture: true,
  onDragEndCapture: true,
  onDragEnterCapture: true,
  onDragExitCapture: true,
  onDragLeaveCapture: true,
  onDragOverCapture: true,
  onDragStartCapture: true,
  onDropCapture: true,
  onMouseDownCapture: true,
  onMouseEnterCapture: true,
  onMouseLeaveCapture: true,
  onMouseMoveCapture: true,
  onMouseOutCapture: true,
  onMouseOverCapture: true,
  onMouseUpCapture: true,
  onSelectCapture: true,
  onTouchCancelCapture: true,
  onTouchEndCapture: true,
  onTouchMoveCapture: true,
  onTouchStartCapture: true,
  onScrollCapture: true,
  onWheelCapture: true,
  onAbortCapture: true,
  onCanPlayCapture: true,
  onCanPlayThroughCapture: true,
  onDurationChangeCapture: true,
  onEmptiedCapture: true,
  onEncryptedCapture: true,
  onEndedCapture: true,
  onErrorCapture: true,
  onLoadedDataCapture: true,
  onLoadedMetadataCapture: true,
  onLoadStartCapture: true,
  onPauseCapture: true,
  onPlayCapture: true,
  onPlayingCapture: true,
  onProgressCapture: true,
  onRateChangeCapture: true,
  onSeekedCapture: true,
  onSeekingCapture: true,
  onStalledCapture: true,
  onSuspendCapture: true,
  onTimeUpdateCapture: true,
  onVolumeChangeCapture: true,
  onWaitingCapture: true,
  onLoadCapture: true,
  onAnimationStartCapture: true,
  onAnimationEndCapture: true,
  onAnimationIterationCapture: true,
  onTransitionEndCapture: true
};

/* From HTMLDOMPropertyConfig */
var htmlProps = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: true,
  allowTransparency: true,
  alt: true,
  // specifies target context for links with `preload` type
  as: true,
  async: true,
  autoComplete: true,
  // autoFocus is polyfilled/normalized by AutoFocusUtils
  // autoFocus: true,
  autoPlay: true,
  capture: true,
  cellPadding: true,
  cellSpacing: true,
  charSet: true,
  challenge: true,
  checked: true,
  cite: true,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: true,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  default: true,
  defer: true,
  dir: true,
  disabled: true,
  download: true,
  draggable: true,
  encType: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: true,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: true,
  high: true,
  href: true,
  hrefLang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  inputMode: true,
  integrity: true,
  is: true,
  keyParams: true,
  keyType: true,
  kind: true,
  label: true,
  lang: true,
  list: true,
  loop: true,
  low: true,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  minLength: true,
  // Caution; `option.selected` is not updated if `select.multiple` is
  // disabled with `removeAttribute`.
  multiple: true,
  muted: true,
  name: true,
  nonce: true,
  noValidate: true,
  open: true,
  optimum: true,
  pattern: true,
  placeholder: true,
  playsInline: true,
  poster: true,
  preload: true,
  profile: true,
  radioGroup: true,
  readOnly: true,
  referrerPolicy: true,
  rel: true,
  required: true,
  reversed: true,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scoped: true,
  scrolling: true,
  seamless: true,
  selected: true,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellCheck: true,
  src: true,
  srcDoc: true,
  srcLang: true,
  srcSet: true,
  start: true,
  step: true,
  style: true,
  summary: true,
  tabIndex: true,
  target: true,
  title: true,
  // Setting .type throws on non-<input> tags
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,
  wrap: true,

  /**
   * RDFa Properties
   */
  about: true,
  datatype: true,
  inlist: true,
  prefix: true,
  // property is also supported for OpenGraph in meta tags.
  property: true,
  resource: true,
  typeof: true,
  vocab: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autoCapitalize: true,
  autoCorrect: true,
  // autoSave allows WebKit/Blink to persist values of input fields on page reloads
  autoSave: true,
  // color is for Safari mask-icon link
  color: true,
  // itemProp, itemScope, itemType are for
  // Microdata support. See http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: true,
  itemType: true,
  // itemID and itemRef are for Microdata support as well but
  // only specified in the WHATWG spec document. See
  // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
  itemID: true,
  itemRef: true,
  // results show looking glass icon and recent searches on input
  // search fields in WebKit/Blink
  results: true,
  // IE-only attribute that specifies security restrictions on an iframe
  // as an alternative to the sandbox attribute on IE<10
  security: true,
  // IE-only attribute that controls focus behavior
  unselectable: 0
};

var svgProps = {
  accentHeight: true,
  accumulate: true,
  additive: true,
  alignmentBaseline: true,
  allowReorder: true,
  alphabetic: true,
  amplitude: true,
  arabicForm: true,
  ascent: true,
  attributeName: true,
  attributeType: true,
  autoReverse: true,
  azimuth: true,
  baseFrequency: true,
  baseProfile: true,
  baselineShift: true,
  bbox: true,
  begin: true,
  bias: true,
  by: true,
  calcMode: true,
  capHeight: true,
  clip: true,
  clipPath: true,
  clipRule: true,
  clipPathUnits: true,
  colorInterpolation: true,
  colorInterpolationFilters: true,
  colorProfile: true,
  colorRendering: true,
  contentScriptType: true,
  contentStyleType: true,
  cursor: true,
  cx: true,
  cy: true,
  d: true,
  decelerate: true,
  descent: true,
  diffuseConstant: true,
  direction: true,
  display: true,
  divisor: true,
  dominantBaseline: true,
  dur: true,
  dx: true,
  dy: true,
  edgeMode: true,
  elevation: true,
  enableBackground: true,
  end: true,
  exponent: true,
  externalResourcesRequired: true,
  fill: true,
  fillOpacity: true,
  fillRule: true,
  filter: true,
  filterRes: true,
  filterUnits: true,
  floodColor: true,
  floodOpacity: true,
  focusable: true,
  fontFamily: true,
  fontSize: true,
  fontSizeAdjust: true,
  fontStretch: true,
  fontStyle: true,
  fontVariant: true,
  fontWeight: true,
  format: true,
  from: true,
  fx: true,
  fy: true,
  g1: true,
  g2: true,
  glyphName: true,
  glyphOrientationHorizontal: true,
  glyphOrientationVertical: true,
  glyphRef: true,
  gradientTransform: true,
  gradientUnits: true,
  hanging: true,
  horizAdvX: true,
  horizOriginX: true,
  ideographic: true,
  imageRendering: true,
  in: true,
  in2: true,
  intercept: true,
  k: true,
  k1: true,
  k2: true,
  k3: true,
  k4: true,
  kernelMatrix: true,
  kernelUnitLength: true,
  kerning: true,
  keyPoints: true,
  keySplines: true,
  keyTimes: true,
  lengthAdjust: true,
  letterSpacing: true,
  lightingColor: true,
  limitingConeAngle: true,
  local: true,
  markerEnd: true,
  markerMid: true,
  markerStart: true,
  markerHeight: true,
  markerUnits: true,
  markerWidth: true,
  mask: true,
  maskContentUnits: true,
  maskUnits: true,
  mathematical: true,
  mode: true,
  numOctaves: true,
  offset: true,
  opacity: true,
  operator: true,
  order: true,
  orient: true,
  orientation: true,
  origin: true,
  overflow: true,
  overlinePosition: true,
  overlineThickness: true,
  paintOrder: true,
  panose1: true,
  pathLength: true,
  patternContentUnits: true,
  patternTransform: true,
  patternUnits: true,
  pointerEvents: true,
  points: true,
  pointsAtX: true,
  pointsAtY: true,
  pointsAtZ: true,
  preserveAlpha: true,
  preserveAspectRatio: true,
  primitiveUnits: true,
  r: true,
  radius: true,
  refX: true,
  refY: true,
  renderingIntent: true,
  repeatCount: true,
  repeatDur: true,
  requiredExtensions: true,
  requiredFeatures: true,
  restart: true,
  result: true,
  rotate: true,
  rx: true,
  ry: true,
  scale: true,
  seed: true,
  shapeRendering: true,
  slope: true,
  spacing: true,
  specularConstant: true,
  specularExponent: true,
  speed: true,
  spreadMethod: true,
  startOffset: true,
  stdDeviation: true,
  stemh: true,
  stemv: true,
  stitchTiles: true,
  stopColor: true,
  stopOpacity: true,
  strikethroughPosition: true,
  strikethroughThickness: true,
  string: true,
  stroke: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeLinecap: true,
  strokeLinejoin: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
  surfaceScale: true,
  systemLanguage: true,
  tableValues: true,
  targetX: true,
  targetY: true,
  textAnchor: true,
  textDecoration: true,
  textRendering: true,
  textLength: true,
  to: true,
  transform: true,
  u1: true,
  u2: true,
  underlinePosition: true,
  underlineThickness: true,
  unicode: true,
  unicodeBidi: true,
  unicodeRange: true,
  unitsPerEm: true,
  vAlphabetic: true,
  vHanging: true,
  vIdeographic: true,
  vMathematical: true,
  values: true,
  vectorEffect: true,
  version: true,
  vertAdvY: true,
  vertOriginX: true,
  vertOriginY: true,
  viewBox: true,
  viewTarget: true,
  visibility: true,
  widths: true,
  wordSpacing: true,
  writingMode: true,
  x: true,
  xHeight: true,
  x1: true,
  x2: true,
  xChannelSelector: true,
  xlinkActuate: true,
  xlinkArcrole: true,
  xlinkHref: true,
  xlinkRole: true,
  xlinkShow: true,
  xlinkTitle: true,
  xlinkType: true,
  xmlBase: true,
  xmlns: true,
  xmlnsXlink: true,
  xmlLang: true,
  xmlSpace: true,
  y: true,
  y1: true,
  y2: true,
  yChannelSelector: true,
  z: true,
  zoomAndPan: true
};

/* From DOMProperty */
var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
var isCustomAttribute = RegExp.prototype.test.bind(new RegExp('^(data|aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$'));

var hasOwnProperty = {}.hasOwnProperty;
var validAttr = (function (name) {
  return hasOwnProperty.call(htmlProps, name) || hasOwnProperty.call(svgProps, name) || isCustomAttribute(name.toLowerCase()) || hasOwnProperty.call(reactProps, name);
});

//      


function isTag(target) /* : %checks */{
  return typeof target === 'string';
}

//      


function isStyledComponent(target) /* : %checks */{
  return typeof target === 'function' && typeof target.styledComponentId === 'string';
}

//      

/* eslint-disable no-undef */
function getComponentName(target) {
  return target.displayName || target.name || 'Component';
}

//      


var determineTheme = (function (props, fallbackTheme, defaultProps) {
  // Props should take precedence over ThemeProvider, which should take precedence over
  // defaultProps, but React automatically puts defaultProps on props.

  /* eslint-disable react/prop-types */
  var isDefaultTheme = defaultProps && props.theme === defaultProps.theme;
  var theme = props.theme && !isDefaultTheme ? props.theme : fallbackTheme;
  /* eslint-enable */

  return theme;
});

//      
/**
 * Creates a broadcast that can be listened to, i.e. simple event emitter
 *
 * @see https://github.com/ReactTraining/react-broadcast
 */

var createBroadcast = function createBroadcast(initialState) {
  var listeners = {};
  var id = 0;
  var state = initialState;

  function publish(nextState) {
    state = nextState;

    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (var key in listeners) {
      var listener = listeners[key];
      if (listener === undefined) {
        // eslint-disable-next-line no-continue
        continue;
      }

      listener(state);
    }
  }

  function subscribe(listener) {
    var currentId = id;
    listeners[currentId] = listener;
    id += 1;
    listener(state);
    return currentId;
  }

  function unsubscribe(unsubID) {
    listeners[unsubID] = undefined;
  }

  return { publish: publish, subscribe: subscribe, unsubscribe: unsubscribe };
};

//      
// Helper to call a given function, only once
var once = (function (cb) {
  var called = false;

  return function () {
    if (!called) {
      called = true;
      cb();
    }
  };
});

var _ThemeProvider$childC;
var _ThemeProvider$contex;

//      
/* globals React$Element */
// NOTE: DO NOT CHANGE, changing this is a semver major change!
var CHANNEL = '__styled-components__';
var CHANNEL_NEXT = CHANNEL + 'next__';

var CONTEXT_CHANNEL_SHAPE = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.shape({
  getTheme: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func,
  subscribe: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func,
  unsubscribe: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
});

var warnChannelDeprecated = once(function () {
  // eslint-disable-next-line no-console
  console.error('Warning: Usage of `context.' + CHANNEL + '` as a function is deprecated. It will be replaced with the object on `.context.' + CHANNEL_NEXT + '` in a future version.');
});
/**
 * Provide a theme to an entire react component tree via context and event listeners (have to do
 * both context and event emitter as pure components block context updates)
 */

var ThemeProvider = function (_Component) {
  inherits(ThemeProvider, _Component);

  function ThemeProvider() {
    classCallCheck(this, ThemeProvider);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.unsubscribeToOuterId = -1;

    _this.getTheme = _this.getTheme.bind(_this);
    return _this;
  }

  ThemeProvider.prototype.componentWillMount = function componentWillMount() {
    var _this2 = this;

    // If there is a ThemeProvider wrapper anywhere around this theme provider, merge this theme
    // with the outer theme
    var outerContext = this.context[CHANNEL_NEXT];
    if (outerContext !== undefined) {
      this.unsubscribeToOuterId = outerContext.subscribe(function (theme) {
        _this2.outerTheme = theme;
      });
    }
    this.broadcast = createBroadcast(this.getTheme());
  };

  ThemeProvider.prototype.getChildContext = function getChildContext() {
    var _this3 = this,
        _babelHelpers$extends;

    return _extends({}, this.context, (_babelHelpers$extends = {}, _babelHelpers$extends[CHANNEL_NEXT] = {
      getTheme: this.getTheme,
      subscribe: this.broadcast.subscribe,
      unsubscribe: this.broadcast.unsubscribe
    }, _babelHelpers$extends[CHANNEL] = function (subscriber) {
      warnChannelDeprecated();

      // Patch the old `subscribe` provide via `CHANNEL` for older clients.
      var unsubscribeId = _this3.broadcast.subscribe(subscriber);
      return function () {
        return _this3.broadcast.unsubscribe(unsubscribeId);
      };
    }, _babelHelpers$extends));
  };

  ThemeProvider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (this.props.theme !== nextProps.theme) this.broadcast.publish(this.getTheme(nextProps.theme));
  };

  ThemeProvider.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.unsubscribeToOuterId !== -1) {
      this.context[CHANNEL_NEXT].unsubscribe(this.unsubscribeToOuterId);
    }
  };

  // Get the theme from the props, supporting both (outerTheme) => {} as well as object notation


  ThemeProvider.prototype.getTheme = function getTheme(passedTheme) {
    var theme = passedTheme || this.props.theme;
    if (__WEBPACK_IMPORTED_MODULE_4_is_function___default()(theme)) {
      var mergedTheme = theme(this.outerTheme);
      if (!__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(mergedTheme)) {
        throw new Error('[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!');
      }
      return mergedTheme;
    }
    if (!__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(theme)) {
      throw new Error('[ThemeProvider] Please make your theme prop a plain object');
    }
    return _extends({}, this.outerTheme, theme);
  };

  ThemeProvider.prototype.render = function render() {
    if (!this.props.children) {
      return null;
    }
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.Children.only(this.props.children);
  };

  return ThemeProvider;
}(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

ThemeProvider.childContextTypes = (_ThemeProvider$childC = {}, _ThemeProvider$childC[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _ThemeProvider$childC[CHANNEL_NEXT] = CONTEXT_CHANNEL_SHAPE, _ThemeProvider$childC);
ThemeProvider.contextTypes = (_ThemeProvider$contex = {}, _ThemeProvider$contex[CHANNEL_NEXT] = CONTEXT_CHANNEL_SHAPE, _ThemeProvider$contex);

//      

var escapeRegex = /[[\].#*$><+~=|^:(),"'`]/g;
var multiDashRegex = /--+/g;

// HACK for generating all static styles without needing to allocate
// an empty execution context every single time...
var STATIC_EXECUTION_CONTEXT = {};

var _StyledComponent = (function (ComponentStyle, constructWithOptions) {
  /* We depend on components having unique IDs */
  var identifiers = {};
  var generateId = function generateId(_displayName, parentComponentId) {
    var displayName = typeof _displayName !== 'string' ? 'sc' : _displayName.replace(escapeRegex, '-') // Replace all possible CSS selectors
    .replace(multiDashRegex, '-'); // Replace multiple -- with single -

    var nr = (identifiers[displayName] || 0) + 1;
    identifiers[displayName] = nr;

    var hash = ComponentStyle.generateName(displayName + nr);
    var componentId = displayName + '-' + hash;
    return parentComponentId !== undefined ? parentComponentId + '-' + componentId : componentId;
  };

  var BaseStyledComponent = function (_Component) {
    inherits(BaseStyledComponent, _Component);

    function BaseStyledComponent() {
      var _temp, _this, _ret;

      classCallCheck(this, BaseStyledComponent);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.attrs = {}, _this.state = {
        theme: null,
        generatedClassName: ''
      }, _this.unsubscribeId = -1, _temp), possibleConstructorReturn(_this, _ret);
    }

    BaseStyledComponent.prototype.unsubscribeFromContext = function unsubscribeFromContext() {
      if (this.unsubscribeId !== -1) {
        this.context[CHANNEL_NEXT].unsubscribe(this.unsubscribeId);
      }
    };

    BaseStyledComponent.prototype.buildExecutionContext = function buildExecutionContext(theme, props) {
      var attrs = this.constructor.attrs;

      var context = _extends({}, props, { theme: theme });
      if (attrs === undefined) {
        return context;
      }

      this.attrs = Object.keys(attrs).reduce(function (acc, key) {
        var attr = attrs[key];
        // eslint-disable-next-line no-param-reassign
        acc[key] = typeof attr === 'function' ? attr(context) : attr;
        return acc;
      }, {});

      return _extends({}, context, this.attrs);
    };

    BaseStyledComponent.prototype.generateAndInjectStyles = function generateAndInjectStyles(theme, props) {
      var _constructor = this.constructor,
          attrs = _constructor.attrs,
          componentStyle = _constructor.componentStyle,
          warnTooManyClasses = _constructor.warnTooManyClasses;

      var styleSheet = this.context[CONTEXT_KEY] || StyleSheet.instance;

      // staticaly styled-components don't need to build an execution context object,
      // and shouldn't be increasing the number of class names
      if (componentStyle.isStatic && attrs === undefined) {
        return componentStyle.generateAndInjectStyles(STATIC_EXECUTION_CONTEXT, styleSheet);
      } else {
        var executionContext = this.buildExecutionContext(theme, props);
        var className = componentStyle.generateAndInjectStyles(executionContext, styleSheet);

        if (warnTooManyClasses !== undefined) warnTooManyClasses(className);

        return className;
      }
    };

    BaseStyledComponent.prototype.componentWillMount = function componentWillMount() {
      var _this2 = this;

      var componentStyle = this.constructor.componentStyle;

      var styledContext = this.context[CHANNEL_NEXT];

      // If this is a staticaly-styled component, we don't need to the theme
      // to generate or build styles.
      if (componentStyle.isStatic) {
        var generatedClassName = this.generateAndInjectStyles(STATIC_EXECUTION_CONTEXT, this.props);
        this.setState({ generatedClassName: generatedClassName });
        // If there is a theme in the context, subscribe to the event emitter. This
        // is necessary due to pure components blocking context updates, this circumvents
        // that by updating when an event is emitted
      } else if (styledContext !== undefined) {
        var subscribe = styledContext.subscribe;

        this.unsubscribeId = subscribe(function (nextTheme) {
          // This will be called once immediately
          var theme = determineTheme(_this2.props, nextTheme, _this2.constructor.defaultProps);
          var generatedClassName = _this2.generateAndInjectStyles(theme, _this2.props);

          _this2.setState({ theme: theme, generatedClassName: generatedClassName });
        });
      } else {
        // eslint-disable-next-line react/prop-types
        var theme = this.props.theme || {};
        var _generatedClassName = this.generateAndInjectStyles(theme, this.props);
        this.setState({ theme: theme, generatedClassName: _generatedClassName });
      }
    };

    BaseStyledComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      var _this3 = this;

      // If this is a staticaly-styled component, we don't need to listen to
      // props changes to update styles
      var componentStyle = this.constructor.componentStyle;

      if (componentStyle.isStatic) {
        return;
      }

      this.setState(function (oldState) {
        var theme = determineTheme(nextProps, oldState.theme, _this3.constructor.defaultProps);
        var generatedClassName = _this3.generateAndInjectStyles(theme, nextProps);

        return { theme: theme, generatedClassName: generatedClassName };
      });
    };

    BaseStyledComponent.prototype.componentWillUnmount = function componentWillUnmount() {
      this.unsubscribeFromContext();
    };

    BaseStyledComponent.prototype.render = function render() {
      var _this4 = this;

      // eslint-disable-next-line react/prop-types
      var innerRef = this.props.innerRef;
      var generatedClassName = this.state.generatedClassName;
      var _constructor2 = this.constructor,
          styledComponentId = _constructor2.styledComponentId,
          target = _constructor2.target;


      var isTargetTag = isTag(target);

      var className = [
      // eslint-disable-next-line react/prop-types
      this.props.className, styledComponentId, this.attrs.className, generatedClassName].filter(Boolean).join(' ');

      var baseProps = _extends({}, this.attrs, {
        className: className
      });

      if (isStyledComponent(target)) {
        baseProps.innerRef = innerRef;
      } else {
        baseProps.ref = innerRef;
      }

      var propsForElement = Object.keys(this.props).reduce(function (acc, propName) {
        // Don't pass through non HTML tags through to HTML elements
        // always omit innerRef
        if (propName !== 'innerRef' && propName !== 'className' && (!isTargetTag || validAttr(propName))) {
          // eslint-disable-next-line no-param-reassign
          acc[propName] = _this4.props[propName];
        }

        return acc;
      }, baseProps);

      return Object(__WEBPACK_IMPORTED_MODULE_2_react__["createElement"])(target, propsForElement);
    };

    return BaseStyledComponent;
  }(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

  var createStyledComponent = function createStyledComponent(target, options, rules) {
    var _StyledComponent$cont;

    var _options$displayName = options.displayName,
        displayName = _options$displayName === undefined ? isTag(target) ? 'styled.' + target : 'Styled(' + getComponentName(target) + ')' : _options$displayName,
        _options$componentId = options.componentId,
        componentId = _options$componentId === undefined ? generateId(options.displayName, options.parentComponentId) : _options$componentId,
        _options$ParentCompon = options.ParentComponent,
        ParentComponent = _options$ParentCompon === undefined ? BaseStyledComponent : _options$ParentCompon,
        extendingRules = options.rules,
        attrs = options.attrs;


    var styledComponentId = options.displayName && options.componentId ? options.displayName + '-' + options.componentId : componentId;

    var warnTooManyClasses = void 0;
    if (process.env.NODE_ENV !== 'production') {
      warnTooManyClasses = createWarnTooManyClasses(displayName);
    }

    var componentStyle = new ComponentStyle(extendingRules === undefined ? rules : extendingRules.concat(rules), attrs, styledComponentId);

    var StyledComponent = function (_ParentComponent) {
      inherits(StyledComponent, _ParentComponent);

      function StyledComponent() {
        classCallCheck(this, StyledComponent);
        return possibleConstructorReturn(this, _ParentComponent.apply(this, arguments));
      }

      StyledComponent.withComponent = function withComponent(tag) {
        var previousComponentId = options.componentId,
            optionsToCopy = objectWithoutProperties(options, ['componentId']);


        var newComponentId = previousComponentId && previousComponentId + '-' + (isTag(tag) ? tag : getComponentName(tag));

        var newOptions = _extends({}, optionsToCopy, {
          componentId: newComponentId,
          ParentComponent: StyledComponent
        });

        return createStyledComponent(tag, newOptions, rules);
      };

      createClass(StyledComponent, null, [{
        key: 'extend',
        get: function get$$1() {
          var rulesFromOptions = options.rules,
              parentComponentId = options.componentId,
              optionsToCopy = objectWithoutProperties(options, ['rules', 'componentId']);


          var newRules = rulesFromOptions === undefined ? rules : rulesFromOptions.concat(rules);

          var newOptions = _extends({}, optionsToCopy, {
            rules: newRules,
            parentComponentId: parentComponentId,
            ParentComponent: StyledComponent
          });

          return constructWithOptions(createStyledComponent, target, newOptions);
        }
      }]);
      return StyledComponent;
    }(ParentComponent);

    StyledComponent.contextTypes = (_StyledComponent$cont = {}, _StyledComponent$cont[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _StyledComponent$cont[CHANNEL_NEXT] = CONTEXT_CHANNEL_SHAPE, _StyledComponent$cont[CONTEXT_KEY] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet), __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(ServerStyleSheet)]), _StyledComponent$cont);
    StyledComponent.displayName = displayName;
    StyledComponent.styledComponentId = styledComponentId;
    StyledComponent.attrs = attrs;
    StyledComponent.componentStyle = componentStyle;
    StyledComponent.warnTooManyClasses = warnTooManyClasses;
    StyledComponent.target = target;


    return StyledComponent;
  };

  return createStyledComponent;
});

// murmurhash2 via https://gist.github.com/raycmorgan/588423

function doHash(str, seed) {
  var m = 0x5bd1e995;
  var r = 24;
  var h = seed ^ str.length;
  var length = str.length;
  var currentIndex = 0;

  while (length >= 4) {
    var k = UInt32(str, currentIndex);

    k = Umul32(k, m);
    k ^= k >>> r;
    k = Umul32(k, m);

    h = Umul32(h, m);
    h ^= k;

    currentIndex += 4;
    length -= 4;
  }

  switch (length) {
    case 3:
      h ^= UInt16(str, currentIndex);
      h ^= str.charCodeAt(currentIndex + 2) << 16;
      h = Umul32(h, m);
      break;

    case 2:
      h ^= UInt16(str, currentIndex);
      h = Umul32(h, m);
      break;

    case 1:
      h ^= str.charCodeAt(currentIndex);
      h = Umul32(h, m);
      break;
  }

  h ^= h >>> 13;
  h = Umul32(h, m);
  h ^= h >>> 15;

  return h >>> 0;
}

function UInt32(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8) + (str.charCodeAt(pos++) << 16) + (str.charCodeAt(pos) << 24);
}

function UInt16(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8);
}

function Umul32(n, m) {
  n = n | 0;
  m = m | 0;
  var nlo = n & 0xffff;
  var nhi = n >>> 16;
  var res = nlo * m + ((nhi * m & 0xffff) << 16) | 0;
  return res;
}

//      
var isStaticRules = function isStaticRules(rules, attrs) {
  for (var i = 0; i < rules.length; i += 1) {
    var rule = rules[i];

    // recursive case
    if (Array.isArray(rule) && !isStaticRules(rule)) {
      return false;
    } else if (typeof rule === 'function' && !isStyledComponent(rule)) {
      // functions are allowed to be static if they're just being
      // used to get the classname of a nested styled copmonent
      return false;
    }
  }

  if (attrs !== undefined) {
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (var key in attrs) {
      var value = attrs[key];
      if (typeof value === 'function') {
        return false;
      }
    }
  }

  return true;
};

/*
 ComponentStyle is all the CSS-specific stuff, not
 the React-specific stuff.
 */
var _ComponentStyle = (function (nameGenerator, flatten, stringifyRules) {
  var ComponentStyle = function () {
    function ComponentStyle(rules, attrs, componentId) {
      classCallCheck(this, ComponentStyle);

      this.rules = rules;
      this.isStatic = isStaticRules(rules, attrs);
      this.componentId = componentId;
      if (!StyleSheet.instance.hasInjectedComponent(this.componentId)) {
        var placeholder = process.env.NODE_ENV !== 'production' ? '.' + componentId + ' {}' : '';
        StyleSheet.instance.deferredInject(componentId, true, placeholder);
      }
    }

    /*
     * Flattens a rule set into valid CSS
     * Hashes it, wraps the whole chunk in a .hash1234 {}
     * Returns the hash to be injected on render()
     * */


    ComponentStyle.prototype.generateAndInjectStyles = function generateAndInjectStyles(executionContext, styleSheet) {
      var isStatic = this.isStatic,
          lastClassName = this.lastClassName;

      if (isStatic && lastClassName !== undefined) {
        return lastClassName;
      }

      var flatCSS = flatten(this.rules, executionContext);
      var hash = doHash(this.componentId + flatCSS.join(''));

      var existingName = styleSheet.getName(hash);
      if (existingName !== undefined) {
        if (styleSheet.stylesCacheable) {
          this.lastClassName = existingName;
        }
        return existingName;
      }

      var name = nameGenerator(hash);
      if (styleSheet.stylesCacheable) {
        this.lastClassName = existingName;
      }
      if (styleSheet.alreadyInjected(hash, name)) {
        return name;
      }

      var css = '\n' + stringifyRules(flatCSS, '.' + name);
      // NOTE: this can only be set when we inject the class-name.
      // For some reason, presumably due to how css is stringifyRules behaves in
      // differently between client and server, styles break.
      styleSheet.inject(this.componentId, true, css, hash, name);
      return name;
    };

    ComponentStyle.generateName = function generateName(str) {
      return nameGenerator(doHash(str));
    };

    return ComponentStyle;
  }();

  return ComponentStyle;
});

//      
// Thanks to ReactDOMFactories for this handy list!

var domElements = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',

// SVG
'circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'text', 'tspan'];

//      

var _styled = (function (styledComponent, constructWithOptions) {
  var styled = function styled(tag) {
    return constructWithOptions(styledComponent, tag);
  };

  // Shorthands for all valid HTML Elements
  domElements.forEach(function (domElement) {
    styled[domElement] = styled(domElement);
  });

  return styled;
});

//      
var replaceWhitespace = function replaceWhitespace(str) {
  return str.replace(/\s|\\n/g, '');
};

var _keyframes = (function (nameGenerator, stringifyRules, css) {
  return function (strings) {
    for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      interpolations[_key - 1] = arguments[_key];
    }

    var rules = css.apply(undefined, [strings].concat(interpolations));
    var hash = doHash(replaceWhitespace(JSON.stringify(rules)));

    var existingName = StyleSheet.instance.getName(hash);
    if (existingName) return existingName;

    var name = nameGenerator(hash);
    if (StyleSheet.instance.alreadyInjected(hash, name)) return name;

    var generatedCSS = stringifyRules(rules, name, '@keyframes');
    StyleSheet.instance.inject('sc-keyframes-' + name, true, generatedCSS, hash, name);
    return name;
  };
});

//      
var _injectGlobal = (function (stringifyRules, css) {
  var injectGlobal = function injectGlobal(strings) {
    for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      interpolations[_key - 1] = arguments[_key];
    }

    var rules = css.apply(undefined, [strings].concat(interpolations));
    var hash = doHash(JSON.stringify(rules));

    var componentId = 'sc-global-' + hash;
    if (StyleSheet.instance.hasInjectedComponent(componentId)) return;

    StyleSheet.instance.inject(componentId, false, stringifyRules(rules));
  };

  return injectGlobal;
});

//      


var _constructWithOptions = (function (css) {
  var constructWithOptions = function constructWithOptions(componentConstructor, tag) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof tag !== 'string' && typeof tag !== 'function') {
      // $FlowInvalidInputTest
      throw new Error('Cannot create styled-component for component: ' + tag);
    }

    /* This is callable directly as a template function */
    var templateFunction = function templateFunction(strings) {
      for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        interpolations[_key - 1] = arguments[_key];
      }

      return componentConstructor(tag, options, css.apply(undefined, [strings].concat(interpolations)));
    };

    /* If config methods are called, wrap up a new template function and merge options */
    templateFunction.withConfig = function (config) {
      return constructWithOptions(componentConstructor, tag, _extends({}, options, config));
    };
    templateFunction.attrs = function (attrs) {
      return constructWithOptions(componentConstructor, tag, _extends({}, options, {
        attrs: _extends({}, options.attrs || {}, attrs) }));
    };

    return templateFunction;
  };

  return constructWithOptions;
});

//      
/* globals ReactClass */

var wrapWithTheme = function wrapWithTheme(Component$$1) {
  var _WithTheme$contextTyp;

  var componentName = Component$$1.displayName || Component$$1.name || 'Component';

  var isStyledComponent$$1 = isStyledComponent(Component$$1);

  var WithTheme = function (_React$Component) {
    inherits(WithTheme, _React$Component);

    function WithTheme() {
      var _temp, _this, _ret;

      classCallCheck(this, WithTheme);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {}, _this.unsubscribeId = -1, _temp), possibleConstructorReturn(_this, _ret);
    }

    // NOTE: This is so that isStyledComponent passes for the innerRef unwrapping


    WithTheme.prototype.componentWillMount = function componentWillMount() {
      var _this2 = this;

      var defaultProps = this.constructor.defaultProps;

      var styledContext = this.context[CHANNEL_NEXT];
      var themeProp = determineTheme(this.props, undefined, defaultProps);
      if (styledContext === undefined && themeProp === undefined && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[withTheme] You are not using a ThemeProvider nor passing a theme prop or a theme in defaultProps');
      } else if (styledContext === undefined && themeProp !== undefined) {
        this.setState({ theme: themeProp });
      } else {
        var subscribe = styledContext.subscribe;

        this.unsubscribeId = subscribe(function (nextTheme) {
          var theme = determineTheme(_this2.props, nextTheme, defaultProps);
          _this2.setState({ theme: theme });
        });
      }
    };

    WithTheme.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      var defaultProps = this.constructor.defaultProps;

      this.setState(function (oldState) {
        var theme = determineTheme(nextProps, oldState.theme, defaultProps);

        return { theme: theme };
      });
    };

    WithTheme.prototype.componentWillUnmount = function componentWillUnmount() {
      if (this.unsubscribeId !== -1) {
        this.context[CHANNEL_NEXT].unsubscribe(this.unsubscribeId);
      }
    };

    WithTheme.prototype.render = function render() {
      // eslint-disable-next-line react/prop-types
      var innerRef = this.props.innerRef;
      var theme = this.state.theme;


      return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement(Component$$1, _extends({
        theme: theme
      }, this.props, {
        innerRef: isStyledComponent$$1 ? innerRef : undefined,
        ref: isStyledComponent$$1 ? undefined : innerRef
      }));
    };

    return WithTheme;
  }(__WEBPACK_IMPORTED_MODULE_2_react___default.a.Component);

  WithTheme.displayName = 'WithTheme(' + componentName + ')';
  WithTheme.styledComponentId = 'withTheme';
  WithTheme.contextTypes = (_WithTheme$contextTyp = {}, _WithTheme$contextTyp[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _WithTheme$contextTyp[CHANNEL_NEXT] = CONTEXT_CHANNEL_SHAPE, _WithTheme$contextTyp);


  return __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics___default()(WithTheme, Component$$1);
};

//      

/* Import singletons */
/* Import singleton constructors */
/* Import components */
/* Import Higher Order Components */
/* Instantiate singletons */
var ComponentStyle = _ComponentStyle(generateAlphabeticName, flatten, stringifyRules);
var constructWithOptions = _constructWithOptions(css);
var StyledComponent = _StyledComponent(ComponentStyle, constructWithOptions);

/* Instantiate exported singletons */
var keyframes = _keyframes(generateAlphabeticName, stringifyRules, css);
var injectGlobal = _injectGlobal(stringifyRules, css);
var styled = _styled(StyledComponent, constructWithOptions);

/* harmony default export */ __webpack_exports__["default"] = (styled);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var linalg_1 = __webpack_require__(1);
var Layer = /** @class */ (function () {
    function Layer(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.transformation = linalg_1.Matrix4x4.create();
        this.aspectMatrixBuffer = linalg_1.Matrix4x4.create(); // To prevent memory allocation in the render loop
        this.viewMatrixBuffer = linalg_1.Matrix4x4.create(); // To prevent memory allocation in the render loop
        this.image = image;
        this.resize();
    }
    /**
     * Resize the canvas size if its elements size in the browser changed
     * @return whether anything changed
     */
    Layer.prototype.resize = function () {
        var width = Math.floor(this.canvas.clientWidth * window.devicePixelRatio);
        var height = Math.floor(this.canvas.clientHeight * window.devicePixelRatio);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            return true;
        }
        return false;
    };
    /**
     * Compute the scalings in X and Y make sure the (-1,1) x (-1,1) box has the aspect ratio of the image
     * and is positioned centerally in the canvas
     */
    Layer.prototype.getAspect = function () {
        var viewAspect = this.canvas.clientWidth / this.canvas.clientHeight;
        var textAspect = this.image.width / this.image.height;
        var aspect;
        if (viewAspect > textAspect) {
            aspect = { x: textAspect / viewAspect, y: 1.0 };
        }
        else {
            aspect = { x: 1.0, y: viewAspect / textAspect };
        }
        return aspect;
    };
    /**
     * Compute the view matrix from the current transformation and the shape of the window
     */
    Layer.prototype.getViewMatrix = function () {
        var aspect = this.getAspect();
        linalg_1.Matrix4x4.fromScaling(this.aspectMatrixBuffer, [aspect.x, aspect.y, 1.0]);
        linalg_1.Matrix4x4.multiply(this.viewMatrixBuffer, this.aspectMatrixBuffer, this.transformation);
        return this.viewMatrixBuffer;
    };
    return Layer;
}());
exports.default = Layer;
var LossFunction;
(function (LossFunction) {
    LossFunction[LossFunction["L1"] = 1] = "L1";
    LossFunction[LossFunction["L2"] = 2] = "L2";
    LossFunction[LossFunction["MAPE"] = 3] = "MAPE";
    LossFunction[LossFunction["MRSE"] = 4] = "MRSE";
    LossFunction[LossFunction["SMAPE"] = 5] = "SMAPE";
    LossFunction[LossFunction["SSIM"] = 6] = "SSIM";
})(LossFunction = exports.LossFunction || (exports.LossFunction = {}));
var lossFunctions = {
    'L1': LossFunction.L1,
    'L2': LossFunction.L2,
    'MAPE': LossFunction.MAPE,
    'MRSE': LossFunction.MRSE,
    'SMAPE': LossFunction.SMAPE,
    'SSIM': LossFunction.SSIM,
};
function lossFunctionFromString(name) {
    if (lossFunctions.hasOwnProperty(name)) {
        return lossFunctions[name];
    }
    else {
        throw Error("Loss function " + name + " is invalid. Available options: " + Object.keys(lossFunctions));
    }
}
exports.lossFunctionFromString = lossFunctionFromString;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExrParserWorker = __webpack_require__(17);
/**
 * A pool of exr parsing webworkers that get assigned tasks in a round-robin fashion.
 */
var ExrParserPool = /** @class */ (function () {
    function ExrParserPool(nWorkers) {
        this.nWorkers = nWorkers;
        /** To divide the work equally, keep track of the worker that got the previous job. */
        this.nextWorkerId = 0;
        /** Each job that is sent to a worker gets a unique jobId. */
        this.jobId = 0;
        /** After sending a job to a web worker, we register a return handler for when data comes back  */
        this.returnHandlers = {};
        this.workers = [];
        for (var i = 0; i < nWorkers; ++i) {
            var worker = new ExrParserWorker();
            this.workers.push(worker);
            worker.onmessage = this.handleResult.bind(this);
        }
    }
    /**
     * Parse raw EXR data using by assigning the task to a web worker in the pool
     */
    ExrParserPool.prototype.parse = function (url, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var worker = _this.nextWorker();
            var jobId = _this.jobId++;
            _this.returnHandlers[jobId] = function (event) {
                if (event.data.success) {
                    resolve(__assign({ url: url }, event.data.image));
                }
                else {
                    reject(new Error(event.data.message));
                }
            };
            worker.postMessage({ jobId: jobId, data: data }, [data]);
        });
    };
    /**
     * Handler that gets called whenever a result comes back from the webworkers
     * It looks up the corresponding handler by the jobId.
     */
    ExrParserPool.prototype.handleResult = function (event) {
        if (event.data.jobId != null) {
            var callback = this.returnHandlers[event.data.jobId];
            delete this.returnHandlers[event.data.jobId];
            callback(event);
        }
        else {
            throw new Error("Got a message from the webworker without job id.");
        }
    };
    /**
     * Get the web worker whose turn it is
     */
    ExrParserPool.prototype.nextWorker = function () {
        var worker = this.workers[this.nextWorkerId];
        this.nextWorkerId = (this.nextWorkerId + 1) % this.nWorkers;
        return worker;
    };
    return ExrParserPool;
}());
var pool = new ExrParserPool(2);
function parseExr(url, data) {
    return pool.parse(url, data);
}
function loadImage(url) {
    var suffix = url.split('.').pop();
    if (suffix && suffix.toLocaleLowerCase() === 'exr') {
        return loadExr(url);
    }
    else {
        return loadLdr(url);
    }
}
exports.loadImage = loadImage;
function loadExr(url) {
    console.time("Downloading '" + url + "'"); // tslint:disable-line
    return fetch(url)
        .then(function (result) {
        console.timeEnd("Downloading '" + url + "'"); // tslint:disable-line
        return result;
    })
        .then(function (result) { return result.arrayBuffer(); })
        .then(function (data) { return parseExr(url, data); });
}
exports.loadExr = loadExr;
function loadLdr(url) {
    console.time("Downloading '" + url + "'"); // tslint:disable-line
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onerror = function (error) { return reject(new Error("Failed to load '" + url + "'.")); };
        image.onload = function () {
            console.timeEnd("Downloading '" + url + "'"); // tslint:disable-line
            try {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get 2d canvas context.'));
                    return;
                }
                ctx.drawImage(image, 0, 0);
                resolve({
                    url: url,
                    width: image.width,
                    height: image.height,
                    nChannels: 4,
                    data: image,
                    type: 'LdrImage',
                });
            }
            catch (error) {
                reject(new Error("Failed to load image '" + url + "': " + error));
            }
        };
        image.src = url;
    });
}
exports.loadLdr = loadLdr;
var pixelColorCache = new Map();
/**
 * Extract a pixel's color
 * Caches data for LDR images
 * @param image image
 * @param x pixel's x coordinate
 * @param y pixel's y coordinate
 * @param c color channel (r=0, g=1, b=2)
 */
function getPixelColor(image, x, y, c) {
    if (image.type === 'HdrImage') {
        return image.data[(x + y * image.width) * image.nChannels + c];
    }
    else {
        var getColorFnc = pixelColorCache.get(image);
        if (getColorFnc == null) {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx_1 = canvas.getContext('2d');
            if (!ctx_1) {
                throw new Error('Failed to create 2d context to retrieve LDR image data');
            }
            ctx_1.drawImage(image.data, 0, 0, image.width, image.height);
            getColorFnc = function (X, Y, C) { return ctx_1.getImageData(X, Y, 1, 1).data[C] / 256; };
            pixelColorCache.set(image, getColorFnc);
        }
        return getColorFnc(x, y, c);
    }
}
exports.getPixelColor = getPixelColor;
var ImageCache = /** @class */ (function () {
    function ImageCache() {
        this.images = {};
        this.downloading = {};
    }
    ImageCache.prototype.contains = function (url) {
        return this.images.hasOwnProperty(url);
    };
    ImageCache.prototype.currentlyDownloading = function (url) {
        return this.downloading.hasOwnProperty(url);
    };
    ImageCache.prototype.size = function () {
        return Object.keys(this.images).length;
    };
    ImageCache.prototype.get = function (url) {
        if (this.contains(url)) {
            // console.log(`Image ${url} was in cache.`); // tslint:disable-line
            return Promise.resolve(this.images[url]);
        }
        else if (this.currentlyDownloading(url)) {
            return this.downloading[url];
        }
        else {
            // console.log(`Image ${url} is downloaded.`); // tslint:disable-line
            return this.load(url);
        }
    };
    ImageCache.prototype.store = function (url, image) {
        if (this.currentlyDownloading(url)) {
            delete this.currentlyDownloading[url];
        }
        this.images[url] = image;
        return image;
    };
    ImageCache.prototype.load = function (url) {
        var _this = this;
        var imagePromise = loadImage(url);
        this.downloading[url] = imagePromise;
        return imagePromise
            .then(function (image) { return _this.store(url, image); });
    };
    return ImageCache;
}());
exports.ImageCache = ImageCache;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var linalg_1 = __webpack_require__(1);
var ImageLayer_1 = __webpack_require__(10);
var TextLayer_1 = __webpack_require__(11);
var MouseLayer_1 = __webpack_require__(12);
var styled_components_1 = __webpack_require__(3);
var StretchingCanvas = (_a = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], _a.raw = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], styled_components_1.default.canvas(_a));
var StretchingDiv = (_b = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], _b.raw = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], styled_components_1.default.div(_b));
/**
 * An image frame that deals with mouse movement for padding and zooming
 */
var ImageFrame = /** @class */ (function (_super) {
    __extends(ImageFrame, _super);
    function ImageFrame(props) {
        var _this = _super.call(this, props) || this;
        _this.transformation = linalg_1.Matrix4x4.create();
        /** Where to go back when reset() is called */
        _this.defaultTransformation = linalg_1.Matrix4x4.create();
        _this.handleTransformationChange = _this.handleTransformationChange.bind(_this);
        return _this;
    }
    ImageFrame.prototype.componentDidMount = function () {
        this.imageLayer = new ImageLayer_1.default(this.imageLayerElement, this.props.image);
        this.textLayer = new TextLayer_1.default(this.textLayerElement, this.props.image);
        this.mouseLayer = new MouseLayer_1.default(this.mouseLayerElement, this.props.image, this.props.enableMouseEvents);
        this.mouseLayer.onTransformationChange(this.handleTransformationChange);
        this.updateCanvasProps();
        this.handleTransformationChange(this.transformation);
    };
    ImageFrame.prototype.componentDidUpdate = function (prevProps) {
        this.updateCanvasProps(prevProps);
        this.mouseLayer.setEnableMouseEvents(this.props.enableMouseEvents);
    };
    ImageFrame.prototype.componentWillUnmount = function () {
        this.mouseLayer.onPointAt(undefined);
        this.mouseLayer.onTransformationChange(undefined);
        this.mouseLayer.destruct();
    };
    /** Set the default transformation that calling reset() will result in */
    ImageFrame.prototype.setDefaultTransformation = function (transformation) {
        this.defaultTransformation = transformation;
    };
    ImageFrame.prototype.reset = function () {
        this.handleTransformationChange(this.defaultTransformation);
    };
    ImageFrame.prototype.setTransformation = function (transformation) {
        this.handleTransformationChange(transformation);
    };
    ImageFrame.prototype.getTransformation = function () {
        return this.transformation;
    };
    ImageFrame.prototype.render = function () {
        var _this = this;
        return (React.createElement(StretchingDiv, null,
            React.createElement(StretchingCanvas, { innerRef: function (x) { return _this.imageLayerElement = x; } }),
            React.createElement(StretchingCanvas, { innerRef: function (x) { return _this.textLayerElement = x; } }),
            React.createElement(StretchingCanvas, { innerRef: function (x) { return _this.mouseLayerElement = x; } })));
    };
    ImageFrame.prototype.handleTransformationChange = function (transformation) {
        if (this.props.allowMovement) {
            this.transformation = transformation;
            this.imageLayer.setTransformation(transformation);
            this.textLayer.setTransformation(transformation);
            this.mouseLayer.setTransformation(transformation);
            if (this.props.onTransform != null) {
                this.props.onTransform(transformation);
            }
        }
    };
    ImageFrame.prototype.updateCanvasProps = function (previousProps) {
        if (previousProps === void 0) { previousProps = null; }
        if (!previousProps ||
            previousProps.viewTransform !== this.props.viewTransform ||
            previousProps.exposure !== this.props.exposure ||
            previousProps.gamma !== this.props.gamma ||
            previousProps.offset !== this.props.offset) {
            this.imageLayer.setTonemapping({
                viewTransform: this.props.viewTransform,
                exposure: this.props.exposure,
                offset: this.props.offset,
                gamma: this.props.gamma
            });
        }
        if (!previousProps || previousProps.image !== this.props.image) {
            this.imageLayer.setImage(this.props.image);
            this.textLayer.setImage(this.props.image);
            this.mouseLayer.setImage(this.props.image);
        }
        this.mouseLayer.onPointAt(this.props.onPoint);
    };
    return ImageFrame;
}(React.Component));
exports.default = ImageFrame;
var _a, _b;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var cached_function_1 = __webpack_require__(16);
var Layer_1 = __webpack_require__(4);
var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["LDR"] = 0] = "LDR";
    DrawMode[DrawMode["HDR"] = 1] = "HDR";
    DrawMode[DrawMode["ColorMap"] = 2] = "ColorMap";
})(DrawMode || (DrawMode = {}));
var ViewTransform;
(function (ViewTransform) {
    ViewTransform[ViewTransform["None"] = -1] = "None";
    ViewTransform[ViewTransform["Gamma22"] = 0] = "Gamma22";
    ViewTransform[ViewTransform["K1S1"] = 1] = "K1S1";
})(ViewTransform || (ViewTransform = {}));
var vertexShaderSource = "\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nvarying vec2 vTextureCoord;\nuniform mat4 viewMatrix;\nvoid main(void) {\n    gl_Position = viewMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n}";
var fragmentShaderSource = "\nprecision mediump float;\nuniform int viewTransform;\nuniform float exposure;\nuniform float offset;\nuniform float gamma;\nuniform int mode;\nuniform int nChannels;\nuniform int lossFunction;\nuniform int imageHeight; // Height and width are used to access neighboring pixels\nuniform int imageWidth;\nvarying vec2 vTextureCoord;\nuniform sampler2D imASampler;\nuniform sampler2D imBSampler;\nuniform sampler2D cmapSampler;\n\nvec3 lookupOffset(sampler2D sampler, vec2 position, vec2 offset) {\n    // Read neighbouring pixels from an image texture\n    // Takes 'position' (range 0 - 1) and an integer pixel offset 'offset'\n    vec2 imageSize = vec2(imageWidth, imageHeight);\n    return texture2D(sampler, position + offset / imageSize).rgb;\n}\n\nfloat log10(float a) {\n  const float logBase10 = 1.0 / log2( 10.0 );\n\n  return log2(a) * logBase10;\n}\n\nfloat luminance(vec3 rgb) {\n  return dot(vec3(0.2126, 0.7152, 0.0722), rgb);\n}\n\nvec3 GOG(vec3 rgb, float gain, float offset, float gamma) {\n  return pow(gain * rgb + offset, vec3(1.0 / gamma));\n}\n\nfloat logEncodingLogC(float a) {\n  float LogC = a >= 0.01059106816664 ? 0.385537 + 0.2471896 * log10(a * 5.555556 + 0.052272) : a * 5.367655 + 0.092809;\n\n  return LogC;\n}\n\nfloat sigmoidK1S1(float a) {\n  float sigmoid = 1.0 / (1.0 + pow(2.718281828459045, -8.9 * (a - 0.435)));\n\n  return sigmoid;\n}\n\nvec3 viewTransformNone(vec3 rgb) {\n  return rgb;\n}\n\nvec3 viewTransformGamma22(vec3 rgb) {\n  const float exponent = 1.0 / 2.2;\n\n  return pow(max(rgb, 0.0), vec3(exponent, exponent, exponent));\n}\n\nvec3 viewTransformK1S1(vec3 rgb) {\n  vec3 LogC = vec3(logEncodingLogC(rgb.x), logEncodingLogC(rgb.y), logEncodingLogC(rgb.z));\n\n  return vec3(sigmoidK1S1(LogC.x), sigmoidK1S1(LogC.y), sigmoidK1S1(LogC.z));\n}\n\nvec3 applyViewTransform(vec3 rgb, int which) {\n  if (which == " + ViewTransform.None + ") {\n    return viewTransformNone(rgb);\n  } else if (which == " + ViewTransform.Gamma22 + ") {\n    return viewTransformGamma22(rgb);\n  } else if (which == " + ViewTransform.K1S1 + ") {\n    return viewTransformK1S1(rgb);\n  }\n}\n\nvoid main(void) {\n    vec3 col;\n    vec2 position = vec2(vTextureCoord.s, vTextureCoord.t);\n    if (lossFunction == " + Layer_1.LossFunction.L1 + ") {\n        col = texture2D(imASampler, position).rgb;\n        col = col - texture2D(imBSampler, position).rgb;\n        col = abs(col);\n    } else if (lossFunction == " + Layer_1.LossFunction.MAPE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = abs(diff) / (abs(ref) + 1e-2);\n    } else if (lossFunction == " + Layer_1.LossFunction.SMAPE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = 2.0 * abs(diff) / (abs(ref) + abs(img) + 2e-2);\n    } else if (lossFunction == " + Layer_1.LossFunction.MRSE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = diff * diff / (ref * ref + 1e-4);\n    } else if (lossFunction == " + Layer_1.LossFunction.L2 + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = diff * diff;\n    } else if (lossFunction == " + Layer_1.LossFunction.SSIM + ") {\n        const int windowRadius = 2; // We use a symmetric 5x5 window as opposed to the customary 8x8 (wiki)\n        const float L = 1.; // The dynamic range\n        const float k1 = 0.01, k2 = 0.03; // Default constants\n        const float c1 = (k1*L)*(k1*L), c2 = (k2*L)*(k2*L);\n        const float n = float((2 * windowRadius + 1) * (2 * windowRadius + 1));\n\n        // Compute means and standard deviations of both images\n        float aSum, aaSum, bSum, bbSum, abSum;\n        for (int x = 0; x <= 2 * windowRadius; ++x) {\n            for (int y = 0; y <= 2 * windowRadius; ++y) {\n                vec2 offset = vec2(float(x - windowRadius), float(y - windowRadius));\n                float a = luminance(applyViewTransform(lookupOffset(imASampler, position, offset), viewTransform));\n                float b = luminance(applyViewTransform(lookupOffset(imBSampler, position, offset), viewTransform));\n                aSum += a; bSum += b;\n                aaSum += a * a; bbSum += b * b;\n                abSum += a * b;\n            }\n        }\n        float aMean = aSum / n, bMean = bSum / n;\n        float aVar = (aaSum - n * aMean * aMean) / (n + 1.);\n        float bVar = (bbSum - n * bMean * bMean) / (n + 1.);\n        float abCovar = (abSum - n * aMean * bMean) / (n + 1.);\n\n        float numerator = (2. * aMean * bMean + c1) * (2. * abCovar + c2);\n        float denominator = (aMean * aMean + bMean * bMean + c1) * (aVar + bVar + c2);\n        float ssim = numerator / denominator;\n        col = vec3(1. - ssim, 1. - ssim, 1. - ssim);\n    } else {\n        col = texture2D(imASampler, position).rgb;\n        if (nChannels == 1) {\n            col = vec3(col.r, col.r, col.r);\n        }\n    }\n\n    if (mode == " + DrawMode.LDR + ") {\n        col = pow(col, vec3(2.2));\n        col = GOG(col, exposure, offset, gamma);\n        col = applyViewTransform(col, viewTransform);\n    } else if (mode == " + DrawMode.HDR + ") {\n        col = GOG(col, exposure, offset, gamma);\n        col = applyViewTransform(col, viewTransform);\n    } else {\n        float avg = (col.r + col.g + col.b) * 0.3333333333 * exposure;\n        col = texture2D(cmapSampler, vec2(avg, 0.0)).rgb;\n    }\n\n    gl_FragColor = vec4(col, 1.0);\n}";
var imageVertices = new Float32Array([
    // X   Y     Z      U    V
    -1.0, -1.0, 0.0, 0.0, 1.0,
    -1.0, 1.0, 0.0, 0.0, 0.0,
    1.0, -1.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 1.0, 0.0,
]);
var colorMapTexels = new Uint8Array([
    0, 0, 3, 255,
    23, 15, 60, 255,
    67, 15, 117, 255,
    113, 31, 129, 255,
    158, 46, 126, 255,
    205, 63, 112, 255,
    240, 96, 93, 255,
    253, 149, 103, 255,
    254, 201, 141, 255,
    251, 252, 191, 255,
]);
function compileShader(code, type, gl) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!shader || !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Compiling shader failed with error '" + gl.getShaderInfoLog(shader) + "'.");
    }
    return shader;
}
var defaultTonemapping = { viewTransform: 0.0, exposure: 1.0, gamma: 1.0, offset: 0.0 };
/**
 * Image Layer
 */
var ImageLayer = /** @class */ (function (_super) {
    __extends(ImageLayer, _super);
    function ImageLayer(canvas, image) {
        var _this = _super.call(this, canvas, image) || this;
        _this.tonemappingSettings = defaultTonemapping;
        _this.needsRerender = true;
        // Make sure 'this' is available even when these methods are passed as a callback
        _this.checkRender = _this.checkRender.bind(_this);
        _this.invalidate = _this.invalidate.bind(_this);
        _this.initWebGl(canvas);
        // Create a texture cache and load the image texture
        _this.getTexture = cached_function_1.default(_this.createTexture.bind(_this));
        // Draw for the first time
        _this.needsRerender = true;
        requestAnimationFrame(_this.checkRender);
        return _this;
    }
    ImageLayer.prototype.setTransformation = function (transformation) {
        this.transformation = transformation;
        this.invalidate();
    };
    ImageLayer.prototype.setTonemapping = function (tonemapping) {
        this.tonemappingSettings = tonemapping;
        this.invalidate();
    };
    ImageLayer.prototype.setImage = function (image) {
        this.image = image;
        this.invalidate();
    };
    /**
     * Force a new draw the next frame
     */
    ImageLayer.prototype.invalidate = function () {
        this.needsRerender = true;
    };
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    ImageLayer.prototype.checkRender = function () {
        if (this.resize() || this.needsRerender) {
            this.needsRerender = false;
            this.draw();
        }
        requestAnimationFrame(this.checkRender);
    };
    /**
     * Paint a new image
     */
    ImageLayer.prototype.draw = function () {
        if (!this.cmapTexture) {
            throw new Error('Textures need to be initialized before calling draw()');
        }
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.uniform1i(this.glUniforms.viewTransform, this.tonemappingSettings.viewTransform);
        this.gl.uniform1f(this.glUniforms.exposure, this.tonemappingSettings.exposure);
        this.gl.uniform1f(this.glUniforms.offset, this.tonemappingSettings.offset);
        this.gl.uniform1f(this.glUniforms.gamma, this.tonemappingSettings.gamma);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // tslint:disable-line
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
        this.gl.vertexAttribPointer(this.glAttributes.vertexPosition, 3, this.gl.FLOAT, false, 5 * imageVertices.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribPointer(this.glAttributes.vertexTextureCoordinate, 2, this.gl.FLOAT, false, 5 * imageVertices.BYTES_PER_ELEMENT, // stride
        3 * imageVertices.BYTES_PER_ELEMENT // offset
        );
        this.gl.uniform1i(this.glUniforms.imageHeight, this.image.height);
        this.gl.uniform1i(this.glUniforms.imageWidth, this.image.width);
        if (this.image.type === 'Difference') {
            this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.ColorMap);
            this.gl.uniform1i(this.glUniforms.lossFunction, this.image.lossFunction);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image.imageA));
            this.gl.uniform1i(this.glUniforms.imASampler, 0);
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image.imageB));
            this.gl.uniform1i(this.glUniforms.imBSampler, 1);
        }
        else {
            if (this.image.nChannels === 1) {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.ColorMap);
            }
            else if (this.image.type === 'HdrImage') {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.HDR);
            }
            else {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.LDR);
            }
            this.gl.uniform1i(this.glUniforms.lossFunction, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image));
            this.gl.uniform1i(this.glUniforms.imASampler, 0);
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image));
            this.gl.uniform1i(this.glUniforms.imBSampler, 1);
        }
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.cmapTexture);
        this.gl.uniform1i(this.glUniforms.cmapSampler, 2);
        this.gl.uniform1i(this.glUniforms.nChannels, this.image.nChannels);
        var viewMatrix = this.getViewMatrix();
        this.gl.uniformMatrix4fv(this.glUniforms.viewMatrix, false, viewMatrix.data);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    ImageLayer.prototype.initWebGl = function (canvas) {
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('Please upgrade your browser to one that supports WebGL.');
        }
        if (!this.gl.getExtension('OES_texture_float')) {
            throw new Error('Your browser does not supports WebGL FLoating Point Textures.');
        }
        this.gl.clearColor(0.25, 0.25, 0.25, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        var program = this.initShaders();
        this.quadVertexBuffer = this.initQuadVertexBuffer();
        this.glAttributes = this.initAttributes(program);
        this.glUniforms = this.initUniforms(program);
        this.cmapTexture = this.initCmapTexture();
    };
    ImageLayer.prototype.initShaders = function () {
        var vertexShader = compileShader(vertexShaderSource, this.gl.VERTEX_SHADER, this.gl);
        var fragmentShader = compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER, this.gl);
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!program || !this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Failed to link the program.');
        }
        this.gl.useProgram(program);
        return program;
    };
    ImageLayer.prototype.initCmapTexture = function () {
        var cmapTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, cmapTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, colorMapTexels.length / 4, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, colorMapTexels);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        if (!cmapTexture) {
            throw new Error('Failed to initialize color map texture.');
        }
        return cmapTexture;
    };
    ImageLayer.prototype.initQuadVertexBuffer = function () {
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, imageVertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        if (!buffer) {
            throw new Error('Failed to initialize quad vertex buffer.');
        }
        return buffer;
    };
    ImageLayer.prototype.initAttributes = function (program) {
        var attributes = {
            vertexPosition: this.gl.getAttribLocation(program, 'aVertexPosition'),
            vertexTextureCoordinate: this.gl.getAttribLocation(program, 'aTextureCoord'),
        };
        this.gl.enableVertexAttribArray(attributes.vertexPosition);
        this.gl.enableVertexAttribArray(attributes.vertexTextureCoordinate);
        return attributes;
    };
    ImageLayer.prototype.initUniforms = function (program) {
        var _this = this;
        var getUniformLocation = function (name) {
            var location = _this.gl.getUniformLocation(program, name);
            if (!location) {
                throw new Error("Failed to get uniform location for '" + name + "'.");
            }
            return location;
        };
        return {
            drawMode: getUniformLocation('mode'),
            lossFunction: getUniformLocation('lossFunction'),
            nChannels: getUniformLocation('nChannels'),
            viewMatrix: getUniformLocation('viewMatrix'),
            imASampler: getUniformLocation('imASampler'),
            imBSampler: getUniformLocation('imBSampler'),
            cmapSampler: getUniformLocation('cmapSampler'),
            viewTransform: getUniformLocation('viewTransform'),
            exposure: getUniformLocation('exposure'),
            offset: getUniformLocation('offset'),
            gamma: getUniformLocation('gamma'),
            imageWidth: getUniformLocation('imageWidth'),
            imageHeight: getUniformLocation('imageHeight'),
        };
    };
    ImageLayer.prototype.createTexture = function (image) {
        var texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to initialize image texture');
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        if (image.type === 'HdrImage') {
            if (image.nChannels === 1) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, image.width, image.height, 0, this.gl.LUMINANCE, this.gl.FLOAT, image.data);
            }
            else if (image.nChannels === 3) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, image.width, image.height, 0, this.gl.RGB, this.gl.FLOAT, image.data);
            }
            else {
                throw new Error("Don't know what to do with " + image.nChannels + " image channels.");
            }
        }
        else {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image.data);
        }
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    };
    return ImageLayer;
}(Layer_1.default));
exports.default = ImageLayer;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var linalg_1 = __webpack_require__(1);
var Layer_1 = __webpack_require__(4);
var image_loading_1 = __webpack_require__(5);
var TextLayer = /** @class */ (function (_super) {
    __extends(TextLayer, _super);
    function TextLayer(canvas, image) {
        var _this = _super.call(this, canvas, image) || this;
        _this.needsRerender = true;
        // Create canvas 2d drawing context
        var context = canvas.getContext('2d');
        if (context == null) {
            throw new Error('Failed to create 2D context for TextOverlay');
        }
        _this.context = context;
        // Make sure 'this' is available even when these methods are passed as callbacks
        _this.checkRender = _this.checkRender.bind(_this);
        _this.invalidate = _this.invalidate.bind(_this);
        // Draw for the first time
        _this.needsRerender = true;
        requestAnimationFrame(_this.checkRender);
        return _this;
    }
    TextLayer.prototype.setTransformation = function (transformation) {
        this.transformation = transformation;
        this.invalidate();
    };
    TextLayer.prototype.setImage = function (image) {
        this.image = image;
        this.invalidate();
    };
    /**
     * Force a new draw
     */
    TextLayer.prototype.invalidate = function () {
        this.needsRerender = true;
    };
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    TextLayer.prototype.checkRender = function () {
        if (this.resize() || this.needsRerender) {
            this.needsRerender = false;
            this.draw();
        }
        requestAnimationFrame(this.checkRender);
    };
    /**
     * Paint a new overlay
     */
    TextLayer.prototype.draw = function () {
        var canvas = this.context.canvas;
        var leftTop = linalg_1.Vector4.fromValues(-1, 1, 0.0, 1.0);
        var rightBottom = linalg_1.Vector4.fromValues(1, -1, 0.0, 1.0);
        var mvMatrix = this.getViewMatrix();
        var invMvMatrix = linalg_1.Matrix4x4.create();
        linalg_1.Matrix4x4.invert(invMvMatrix, mvMatrix);
        var image = this.image;
        linalg_1.Vector4.transformMat4(leftTop, leftTop, invMvMatrix);
        linalg_1.Vector4.transformMat4(rightBottom, rightBottom, invMvMatrix);
        this.convertClipToRaster(leftTop, leftTop, image.width, image.height);
        this.convertClipToRaster(rightBottom, rightBottom, image.width, image.height);
        var px = Math.floor(leftTop.data[0]);
        var py = Math.floor(leftTop.data[1]);
        var qx = Math.floor(rightBottom.data[0]);
        var qy = Math.floor(rightBottom.data[1]);
        var lineHeight = Math.floor(20 * window.devicePixelRatio);
        var fontSize = Math.floor(16 * window.devicePixelRatio);
        var nx = canvas.width / (lineHeight * 3 + 2);
        var ny = canvas.height / (lineHeight * 3 + 2);
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        if (image.type === 'Difference') {
            // We don't have access to computed values, so won't show the HUD
            return;
        }
        var zoomedInEnough = rightBottom.data[0] - leftTop.data[0] < nx && rightBottom.data[1] - leftTop.data[1] < ny;
        if (zoomedInEnough) {
            this.context.font = fontSize + "px sans-serif";
            for (var y = Math.max(0, py); y <= Math.min(image.height - 1, qy); y++) {
                for (var x = Math.max(0, px); x <= Math.min(image.width - 1, qx); x++) {
                    linalg_1.Vector4.set(leftTop, x, y, 0.0, 1.0);
                    this.convertRasterToClip(leftTop, leftTop, image.width, image.height);
                    linalg_1.Vector4.transformMat4(leftTop, leftTop, mvMatrix);
                    this.convertClipToRaster(leftTop, leftTop, canvas.width, canvas.height);
                    var r = void 0, g = void 0, b = void 0;
                    if (image.nChannels === 1) {
                        r = image_loading_1.getPixelColor(image, x, y, 0);
                        this.context.fillStyle = '#888888';
                        this.context.fillText(r.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize);
                    }
                    else {
                        r = image_loading_1.getPixelColor(image, x, y, 0);
                        g = image_loading_1.getPixelColor(image, x, y, 1);
                        b = image_loading_1.getPixelColor(image, x, y, 2);
                        this.context.fillStyle = '#990000';
                        this.context.fillText(r.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize);
                        this.context.fillStyle = '#009900';
                        this.context.fillText(g.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize + lineHeight);
                        this.context.fillStyle = '#0000FF';
                        this.context.fillText(b.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize + 2 * lineHeight);
                    }
                }
            }
        }
    };
    /**
     * Convert coordinates from clip space to raster space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    TextLayer.prototype.convertClipToRaster = function (out, a, xres, yres) {
        out.data[0] = (a.data[0] + 1.0) * 0.5 * xres;
        out.data[1] = (1.0 - a.data[1]) * 0.5 * yres;
        return out;
    };
    /**
     * Convert coordinates from raster space to clip space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    TextLayer.prototype.convertRasterToClip = function (out, a, xres, yres) {
        out.data[0] = a.data[0] * 2.0 / xres - 1.0;
        out.data[1] = 1.0 - (a.data[1] * 2.0 / yres);
        return out;
    };
    return TextLayer;
}(Layer_1.default));
exports.default = TextLayer;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var linalg_1 = __webpack_require__(1);
var Layer_1 = __webpack_require__(4);
var normalizeWheel = __webpack_require__(18);
var SCROLL_FACTOR = 1.001;
/**
 * Mouse Layer
 * @todo add some proper documentation
 */
var MouseLayer = /** @class */ (function (_super) {
    __extends(MouseLayer, _super);
    function MouseLayer(canvas, image, enableMouseEvents) {
        var _this = _super.call(this, canvas, image) || this;
        _this.panningState = null;
        _this.unsubscribeFunctions = []; /** To be called on destruct */
        _this.handleMouseMove = _this.handleMouseMove.bind(_this);
        _this.handleMouseDown = _this.handleMouseDown.bind(_this);
        _this.handleMouseUp = _this.handleMouseUp.bind(_this);
        _this.handleScroll = _this.handleScroll.bind(_this);
        _this.handlePointReporting = _this.handlePointReporting.bind(_this);
        _this.enableMouseEvents = enableMouseEvents;
        // Subscribe to changes in the layers reactive inputs and window size
        var unsubscribe;
        document.addEventListener('mouseup', _this.handleMouseUp);
        unsubscribe = document.removeEventListener.bind(document, 'mouseup', _this.handleMouseUp);
        _this.unsubscribeFunctions.push(unsubscribe);
        document.addEventListener('mousemove', _this.handleMouseMove);
        unsubscribe = document.removeEventListener.bind(document, 'mousemove', _this.handleMouseMove);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('wheel', _this.handleScroll);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'wheel', _this.handleScroll);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('mousedown', _this.handleMouseDown);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'mousedown', _this.handleMouseDown);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('mousemove', _this.handlePointReporting);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'mousemove', _this.handlePointReporting);
        _this.unsubscribeFunctions.push(unsubscribe);
        return _this;
    }
    MouseLayer.prototype.setTransformation = function (transformation, broadcast) {
        if (broadcast === void 0) { broadcast = false; }
        this.transformation = transformation;
        if (broadcast && this.transformationCallback != null) {
            this.transformationCallback(transformation);
        }
    };
    MouseLayer.prototype.setEnableMouseEvents = function (enable) {
        this.enableMouseEvents = enable;
    };
    MouseLayer.prototype.onTransformationChange = function (callback) {
        this.transformationCallback = callback;
    };
    MouseLayer.prototype.setImage = function (image) {
        this.image = image;
    };
    MouseLayer.prototype.onPointAt = function (callback) {
        this.pointCallback = callback;
    };
    MouseLayer.prototype.destruct = function () {
        this.unsubscribeFunctions.forEach(function (fn) { return fn(); });
    };
    MouseLayer.prototype.handleMouseMove = function (event) {
        if (!this.enableMouseEvents) {
            return;
        }
        if (this.panningState) {
            var _a = this.relativeMousePosition(event.clientX, event.clientY), x = _a.x, y = _a.y;
            var dx = x - this.panningState.previousMouse.x;
            var dy = y - this.panningState.previousMouse.y;
            var transformation = linalg_1.Matrix4x4.create();
            var aspect = this.getAspect();
            linalg_1.Matrix4x4.translate(transformation, transformation, [dx / aspect.x, dy / aspect.y, 0.0]);
            linalg_1.Matrix4x4.multiply(transformation, transformation, this.transformation);
            this.setTransformation(transformation, true);
            this.panningState.previousMouse = { x: x, y: y };
        }
    };
    MouseLayer.prototype.handleMouseUp = function (event) {
        if (this.panningState) {
            this.panningState = null;
        }
    };
    MouseLayer.prototype.handleMouseDown = function (event) {
        var mousePosition = this.relativeMousePosition(event.clientX, event.clientY);
        this.panningState = {
            transformationAtStart: linalg_1.Matrix4x4.clone(this.transformation),
            previousMouse: mousePosition,
        };
    };
    MouseLayer.prototype.handleScroll = function (event) {
        if (!this.enableMouseEvents) {
            return;
        }
        event.preventDefault();
        var pixelY = normalizeWheel(event).pixelY;
        var mouse = this.relativeMousePosition(event.clientX, event.clientY);
        var transformation = linalg_1.Matrix4x4.create();
        var deltaMatrix = linalg_1.Matrix4x4.create();
        var aspect = this.getAspect();
        linalg_1.Matrix4x4.translate(deltaMatrix, deltaMatrix, [mouse.x / aspect.x, mouse.y / aspect.y, 0.0]);
        var scaleFactor = Math.pow(SCROLL_FACTOR, pixelY);
        linalg_1.Matrix4x4.scale(deltaMatrix, deltaMatrix, [scaleFactor, scaleFactor, 1.0]);
        linalg_1.Matrix4x4.translate(deltaMatrix, deltaMatrix, [-mouse.x / aspect.x, -mouse.y / aspect.y, 0.0]);
        linalg_1.Matrix4x4.multiply(transformation, deltaMatrix, this.transformation);
        this.setTransformation(transformation, true);
    };
    /**
     * Event handler for reporting mouse movement.
     *
     * Only applicable when the options 'onPoint' property is set on this component.
     */
    MouseLayer.prototype.handlePointReporting = function (event) {
        if (this.pointCallback) {
            if (!this.panningState) {
                var _a = this.relativeMousePosition(event.clientX, event.clientY), x = _a.x, y = _a.y;
                var imageCoordinates = this.canvasToImage(x, y);
                this.pointCallback(imageCoordinates.x, imageCoordinates.y);
            }
        }
    };
    /**
     * Translate clientX and clientY values to relative positions within the bounding box
     * of the viewer.
     */
    MouseLayer.prototype.relativeMousePosition = function (clientX, clientY) {
        var _a = this.canvas, clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
        var _b = this.canvas.getBoundingClientRect(), left = _b.left, top = _b.top;
        return {
            x: -1.0 + 2.0 * (clientX - left) / clientWidth,
            y: 1.0 - 2.0 * (clientY - top) / clientHeight,
        };
    };
    /**
     * Translate canvas coordinates to image coodrinates
     */
    MouseLayer.prototype.canvasToImage = function (x, y) {
        var point = linalg_1.Vector4.create();
        linalg_1.Vector4.set(point, x, y, 1.0, 1.0);
        var inverseViewMatrix = linalg_1.Matrix4x4.create();
        var viewMatrix = this.getViewMatrix();
        linalg_1.Matrix4x4.invert(inverseViewMatrix, viewMatrix);
        linalg_1.Vector4.transformMat4(point, point, inverseViewMatrix);
        return { x: point.data[0], y: point.data[1] };
    };
    return MouseLayer;
}(Layer_1.default));
exports.default = MouseLayer;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var emptyFunction = __webpack_require__(6);

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var ReactDOM = __webpack_require__(15);
var ImageFrame_1 = __webpack_require__(9);
exports.ImageFrame = ImageFrame_1.default;
var ImageViewer_1 = __webpack_require__(33);
exports.ImageViewer = ImageViewer_1.default;
var ImageLayer_1 = __webpack_require__(10);
exports.ImageLayer = ImageLayer_1.default;
var TextLayer_1 = __webpack_require__(11);
exports.TextLayer = TextLayer_1.default;
var MouseLayer_1 = __webpack_require__(12);
exports.MouseLayer = MouseLayer_1.default;
var image_loading_1 = __webpack_require__(5);
exports.loadImage = image_loading_1.loadImage;
exports.ImageCache = image_loading_1.ImageCache;
var linalg_1 = __webpack_require__(1);
exports.Matrix4x4 = linalg_1.Matrix4x4;
exports.Vector4 = linalg_1.Vector4;
function renderViewer(elem, data, baseUrl) {
    if (baseUrl === void 0) { baseUrl = ''; }
    var component = (React.createElement(ImageViewer_1.default, { data: data, baseUrl: baseUrl, sortMenu: false, removeCommonPrefix: false }));
    return ReactDOM.render(component, elem);
}
exports.renderViewer = renderViewer;
exports.default = ImageViewer_1.default;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function cachedFunction(f) {
    var cachedValues = new Map();
    return function (input) {
        var cachedResult = cachedValues.get(input);
        if (cachedResult) {
            return cachedResult;
        }
        else {
            var output = f(input);
            cachedValues.set(input, output);
            return output;
        }
    };
}
exports.default = cachedFunction;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return new Worker(__webpack_require__.p + "exr.worker.js");
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(19);


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule normalizeWheel
 * @typechecks
 */



var UserAgent_DEPRECATED = __webpack_require__(20);

var isEventSupported = __webpack_require__(21);


// Reasonable defaults
var PIXEL_STEP  = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;

/**
 * Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
 * complicated, thus this doc is long and (hopefully) detailed enough to answer
 * your questions.
 *
 * If you need to react to the mouse wheel in a predictable way, this code is
 * like your bestest friend. * hugs *
 *
 * As of today, there are 4 DOM event types you can listen to:
 *
 *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
 *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
 *   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
 *   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
 *
 * So what to do?  The is the best:
 *
 *   normalizeWheel.getEventType();
 *
 * In your event callback, use this code to get sane interpretation of the
 * deltas.  This code will return an object with properties:
 *
 *   spinX   -- normalized spin speed (use for zoom) - x plane
 *   spinY   -- " - y plane
 *   pixelX  -- normalized distance (to pixels) - x plane
 *   pixelY  -- " - y plane
 *
 * Wheel values are provided by the browser assuming you are using the wheel to
 * scroll a web page by a number of lines or pixels (or pages).  Values can vary
 * significantly on different platforms and browsers, forgetting that you can
 * scroll at different speeds.  Some devices (like trackpads) emit more events
 * at smaller increments with fine granularity, and some emit massive jumps with
 * linear speed or acceleration.
 *
 * This code does its best to normalize the deltas for you:
 *
 *   - spin is trying to normalize how far the wheel was spun (or trackpad
 *     dragged).  This is super useful for zoom support where you want to
 *     throw away the chunky scroll steps on the PC and make those equal to
 *     the slow and smooth tiny steps on the Mac. Key data: This code tries to
 *     resolve a single slow step on a wheel to 1.
 *
 *   - pixel is normalizing the desired scroll delta in pixel units.  You'll
 *     get the crazy differences between browsers, but at least it'll be in
 *     pixels!
 *
 *   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
 *     should translate to positive value zooming IN, negative zooming OUT.
 *     This matches the newer 'wheel' event.
 *
 * Why are there spinX, spinY (or pixels)?
 *
 *   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
 *     with a mouse.  It results in side-scrolling in the browser by default.
 *
 *   - spinY is what you expect -- it's the classic axis of a mouse wheel.
 *
 *   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
 *     probably is by browsers in conjunction with fancy 3D controllers .. but
 *     you know.
 *
 * Implementation info:
 *
 * Examples of 'wheel' event if you scroll slowly (down) by one step with an
 * average mouse:
 *
 *   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
 *   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
 *   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
 *   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
 *   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
 *
 * On the trackpad:
 *
 *   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
 *   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
 *
 * On other/older browsers.. it's more complicated as there can be multiple and
 * also missing delta values.
 *
 * The 'wheel' event is more standard:
 *
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
 *
 * The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
 * deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
 * backward compatibility with older events.  Those other values help us
 * better normalize spin speed.  Example of what the browsers provide:
 *
 *                          | event.wheelDelta | event.detail
 *        ------------------+------------------+--------------
 *          Safari v5/OS X  |       -120       |       0
 *          Safari v5/Win7  |       -120       |       0
 *         Chrome v17/OS X  |       -120       |       0
 *         Chrome v17/Win7  |       -120       |       0
 *                IE9/Win7  |       -120       |   undefined
 *         Firefox v4/OS X  |     undefined    |       1
 *         Firefox v4/Win7  |     undefined    |       3
 *
 */
function normalizeWheel(/*object*/ event) /*object*/ {
  var sX = 0, sY = 0,       // spinX, spinY
      pX = 0, pY = 0;       // pixelX, pixelY

  // Legacy
  if ('detail'      in event) { sY = event.detail; }
  if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
  if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
  if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

  // side scrolling on FF with DOMMouseScroll
  if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ('deltaY' in event) { pY = event.deltaY; }
  if ('deltaX' in event) { pX = event.deltaX; }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {          // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {                             // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
  if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

  return { spinX  : sX,
           spinY  : sY,
           pixelX : pX,
           pixelY : pY };
}


/**
 * The best combination if you prefer spinX + spinY normalization.  It favors
 * the older DOMMouseScroll for Firefox, as FF does not include wheelDelta with
 * 'wheel' event, making spin speed determination impossible.
 */
normalizeWheel.getEventType = function() /*string*/ {
  return (UserAgent_DEPRECATED.firefox())
           ? 'DOMMouseScroll'
           : (isEventSupported('wheel'))
               ? 'wheel'
               : 'mousewheel';
};

module.exports = normalizeWheel;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule UserAgent_DEPRECATED
 */

/**
 *  Provides entirely client-side User Agent and OS detection. You should prefer
 *  the non-deprecated UserAgent module when possible, which exposes our
 *  authoritative server-side PHP-based detection to the client.
 *
 *  Usage is straightforward:
 *
 *    if (UserAgent_DEPRECATED.ie()) {
 *      //  IE
 *    }
 *
 *  You can also do version checks:
 *
 *    if (UserAgent_DEPRECATED.ie() >= 7) {
 *      //  IE7 or better
 *    }
 *
 *  The browser functions will return NaN if the browser does not match, so
 *  you can also do version compares the other way:
 *
 *    if (UserAgent_DEPRECATED.ie() < 7) {
 *      //  IE6 or worse
 *    }
 *
 *  Note that the version is a float and may include a minor version number,
 *  so you should always use range operators to perform comparisons, not
 *  strict equality.
 *
 *  **Note:** You should **strongly** prefer capability detection to browser
 *  version detection where it's reasonable:
 *
 *    http://www.quirksmode.org/js/support.html
 *
 *  Further, we have a large number of mature wrapper functions and classes
 *  which abstract away many browser irregularities. Check the documentation,
 *  grep for things, or ask on javascript@lists.facebook.com before writing yet
 *  another copy of "event || window.event".
 *
 */

var _populated = false;

// Browsers
var _ie, _firefox, _opera, _webkit, _chrome;

// Actual IE browser for compatibility mode
var _ie_real_version;

// Platforms
var _osx, _windows, _linux, _android;

// Architectures
var _win64;

// Devices
var _iphone, _ipad, _native;

var _mobile;

function _populate() {
  if (_populated) {
    return;
  }

  _populated = true;

  // To work around buggy JS libraries that can't handle multi-digit
  // version numbers, Opera 10's user agent string claims it's Opera
  // 9, then later includes a Version/X.Y field:
  //
  // Opera/9.80 (foo) Presto/2.2.15 Version/10.10
  var uas = navigator.userAgent;
  var agent = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(uas);
  var os    = /(Mac OS X)|(Windows)|(Linux)/.exec(uas);

  _iphone = /\b(iPhone|iP[ao]d)/.exec(uas);
  _ipad = /\b(iP[ao]d)/.exec(uas);
  _android = /Android/i.exec(uas);
  _native = /FBAN\/\w+;/i.exec(uas);
  _mobile = /Mobile/i.exec(uas);

  // Note that the IE team blog would have you believe you should be checking
  // for 'Win64; x64'.  But MSDN then reveals that you can actually be coming
  // from either x64 or ia64;  so ultimately, you should just check for Win64
  // as in indicator of whether you're in 64-bit IE.  32-bit IE on 64-bit
  // Windows will send 'WOW64' instead.
  _win64 = !!(/Win64/.exec(uas));

  if (agent) {
    _ie = agent[1] ? parseFloat(agent[1]) : (
          agent[5] ? parseFloat(agent[5]) : NaN);
    // IE compatibility mode
    if (_ie && document && document.documentMode) {
      _ie = document.documentMode;
    }
    // grab the "true" ie version from the trident token if available
    var trident = /(?:Trident\/(\d+.\d+))/.exec(uas);
    _ie_real_version = trident ? parseFloat(trident[1]) + 4 : _ie;

    _firefox = agent[2] ? parseFloat(agent[2]) : NaN;
    _opera   = agent[3] ? parseFloat(agent[3]) : NaN;
    _webkit  = agent[4] ? parseFloat(agent[4]) : NaN;
    if (_webkit) {
      // We do not add the regexp to the above test, because it will always
      // match 'safari' only since 'AppleWebKit' appears before 'Chrome' in
      // the userAgent string.
      agent = /(?:Chrome\/(\d+\.\d+))/.exec(uas);
      _chrome = agent && agent[1] ? parseFloat(agent[1]) : NaN;
    } else {
      _chrome = NaN;
    }
  } else {
    _ie = _firefox = _opera = _chrome = _webkit = NaN;
  }

  if (os) {
    if (os[1]) {
      // Detect OS X version.  If no version number matches, set _osx to true.
      // Version examples:  10, 10_6_1, 10.7
      // Parses version number as a float, taking only first two sets of
      // digits.  If only one set of digits is found, returns just the major
      // version number.
      var ver = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(uas);

      _osx = ver ? parseFloat(ver[1].replace('_', '.')) : true;
    } else {
      _osx = false;
    }
    _windows = !!os[2];
    _linux   = !!os[3];
  } else {
    _osx = _windows = _linux = false;
  }
}

var UserAgent_DEPRECATED = {

  /**
   *  Check if the UA is Internet Explorer.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  ie: function() {
    return _populate() || _ie;
  },

  /**
   * Check if we're in Internet Explorer compatibility mode.
   *
   * @return bool true if in compatibility mode, false if
   * not compatibility mode or not ie
   */
  ieCompatibilityMode: function() {
    return _populate() || (_ie_real_version > _ie);
  },


  /**
   * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
   * only need this because Skype can't handle 64-bit IE yet.  We need to remove
   * this when we don't need it -- tracked by #601957.
   */
  ie64: function() {
    return UserAgent_DEPRECATED.ie() && _win64;
  },

  /**
   *  Check if the UA is Firefox.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  firefox: function() {
    return _populate() || _firefox;
  },


  /**
   *  Check if the UA is Opera.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  opera: function() {
    return _populate() || _opera;
  },


  /**
   *  Check if the UA is WebKit.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  webkit: function() {
    return _populate() || _webkit;
  },

  /**
   *  For Push
   *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
   */
  safari: function() {
    return UserAgent_DEPRECATED.webkit();
  },

  /**
   *  Check if the UA is a Chrome browser.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  chrome : function() {
    return _populate() || _chrome;
  },


  /**
   *  Check if the user is running Windows.
   *
   *  @return bool `true' if the user's OS is Windows.
   */
  windows: function() {
    return _populate() || _windows;
  },


  /**
   *  Check if the user is running Mac OS X.
   *
   *  @return float|bool   Returns a float if a version number is detected,
   *                       otherwise true/false.
   */
  osx: function() {
    return _populate() || _osx;
  },

  /**
   * Check if the user is running Linux.
   *
   * @return bool `true' if the user's OS is some flavor of Linux.
   */
  linux: function() {
    return _populate() || _linux;
  },

  /**
   * Check if the user is running on an iPhone or iPod platform.
   *
   * @return bool `true' if the user is running some flavor of the
   *    iPhone OS.
   */
  iphone: function() {
    return _populate() || _iphone;
  },

  mobile: function() {
    return _populate() || (_iphone || _ipad || _android || _mobile);
  },

  nativeApp: function() {
    // webviews inside of the native apps
    return _populate() || _native;
  },

  android: function() {
    return _populate() || _android;
  },

  ipad: function() {
    return _populate() || _ipad;
  }
};

module.exports = UserAgent_DEPRECATED;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isEventSupported
 */



var ExecutionEnvironment = __webpack_require__(22);

var useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM ||
      capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in document;

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}

module.exports = isEventSupported;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */



var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(24);

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * light - weight css preprocessor @licence MIT
 */
/* eslint-disable */
(function (factory) {
	 true ? (module['exports'] = factory(null)) :
		typeof define === 'function' && define['amd'] ? define(factory(null)) :
			(window['stylis'] = factory(null))
}(/** @param {*=} options */function factory (options) {

	'use strict'

	/**
	 * Notes
	 *
	 * The ['<method name>'] pattern is used to support closure compiler
	 * the jsdoc signatures are also used to the same effect
	 *
	 * ---- 
	 *
	 * int + int + int === n4 [faster]
	 *
	 * vs
	 *
	 * int === n1 && int === n2 && int === n3
	 *
	 * ----
	 *
	 * switch (int) { case ints...} [faster]
	 *
	 * vs
	 *
	 * if (int == 1 && int === 2 ...)
	 *
	 * ----
	 *
	 * The (first*n1 + second*n2 + third*n3) format used in the property parser
	 * is a simple way to hash the sequence of characters
	 * taking into account the index they occur in
	 * since any number of 3 character sequences could produce duplicates.
	 *
	 * On the other hand sequences that are directly tied to the index of the character
	 * resolve a far more accurate measure, it's also faster
	 * to evaluate one condition in a switch statement
	 * than three in an if statement regardless of the added math.
	 *
	 * This allows the vendor prefixer to be both small and fast.
	 */

	var nullptn = /^\0+/g /* matches leading null characters */
	var formatptn = /[\0\r\f]/g /* matches new line, null and formfeed characters */
	var colonptn = /: */g /* splits animation rules */
	var cursorptn = /zoo|gra/ /* assert cursor varient */
	var transformptn = /([,: ])(transform)/g /* vendor prefix transform, older webkit */
	var animationptn = /,+\s*(?![^(]*[)])/g /* splits multiple shorthand notation animations */
	var propertiesptn = / +\s*(?![^(]*[)])/g /* animation properties */
	var elementptn = / *[\0] */g /* selector elements */
	var selectorptn = /,\r+?/g /* splits selectors */
	var andptn = /([\t\r\n ])*\f?&/g /* match & */
	var escapeptn = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(.*) */
	var invalidptn = /\W+/g /* removes invalid characters from keyframes */
	var keyframeptn = /@(k\w+)\s*(\S*)\s*/ /* matches @keyframes $1 */
	var plcholdrptn = /::(place)/g /* match ::placeholder varient */
	var readonlyptn = /:(read-only)/g /* match :read-only varient */
	var beforeptn = /\s+(?=[{\];=:>])/g /* matches \s before ] ; = : */
	var afterptn = /([[}=:>])\s+/g /* matches \s after characters [ } = : */
	var tailptn = /(\{[^{]+?);(?=\})/g /* matches tail semi-colons ;} */
	var whiteptn = /\s{2,}/g /* matches repeating whitespace */
	var pseudoptn = /([^\(])(:+) */g /* pseudo element */
	var writingptn = /[svh]\w+-[tblr]{2}/ /* match writing mode property values */

	/* vendors */
	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'

	/* character codes */
	var SEMICOLON = 59 /* ; */
	var CLOSEBRACES = 125 /* } */
	var OPENBRACES = 123 /* { */
	var OPENPARENTHESES = 40 /* ( */
	var CLOSEPARENTHESES = 41 /* ) */
	var OPENBRACKET = 91 /* [ */
	var CLOSEBRACKET = 93 /* ] */
	var NEWLINE = 10 /* \n */
	var CARRIAGE = 13 /* \r */
	var TAB = 9 /* \t */
	var AT = 64 /* @ */
	var SPACE = 32 /*   */
	var AND = 38 /* & */
	var DASH = 45 /* - */
	var UNDERSCORE = 95 /* _ */
	var STAR = 42 /* * */
	var COMMA = 44 /* , */
	var COLON = 58 /* : */
	var SINGLEQUOTE = 39 /* ' */
	var DOUBLEQUOTE = 34 /* " */
	var FOWARDSLASH = 47 /* / */
	var GREATERTHAN = 62 /* > */
	var PLUS = 43 /* + */
	var TILDE = 126 /* ~ */
	var NULL = 0 /* \0 */
	var FORMFEED = 12 /* \f */
	var VERTICALTAB = 11 /* \v */

	/* special identifiers */
	var KEYFRAME = 107 /* k */
	var MEDIA = 109 /* m */
	var SUPPORTS = 115 /* s */
	var PLACEHOLDER = 112 /* p */
	var READONLY = 111 /* o */
	var IMPORT = 169 /* <at>i */
	var CHARSET = 163 /* <at>c */
	var DOCUMENT = 100 /* <at>d */

	var column = 1 /* current column */
	var line = 1 /* current line numebr */
	var pattern = 0 /* :pattern */

	var cascade = 1 /* #id h1 h2 vs h1#id h2#id  */
	var vendor = 1 /* vendor prefix */
	var escape = 1 /* escape :global() pattern */
	var compress = 0 /* compress output */
	var semicolon = 0 /* no/semicolon option */
	var preserve = 0 /* preserve empty selectors */

	/* empty reference */
	var array = []

	/* plugins */
	var plugins = []
	var plugged = 0

	/* plugin context */
	var POSTS = -2
	var PREPS = -1
	var UNKWN = 0
	var PROPS = 1
	var BLCKS = 2
	var ATRUL = 3

	/* plugin newline context */
	var unkwn = 0

	/* keyframe animation */
	var keyed = 1
	var key = ''

	/* selector namespace */
	var nscopealt = ''
	var nscope = ''

	/**
	 * Compile
	 *
	 * @param {Array<string>} parent
	 * @param {Array<string>} current
	 * @param {string} body
	 * @param {number} id
	 * @return {string}
	 */
	function compile (parent, current, body, id) {
		var bracket = 0 /* brackets [] */
		var comment = 0 /* comments /* // or /* */
		var parentheses = 0 /* functions () */
		var quote = 0 /* quotes '', "" */

		var first = 0 /* first character code */
		var second = 0 /* second character code */
		var code = 0 /* current character code */
		var tail = 0 /* previous character code */
		var trail = 0 /* character before previous code */
		var peak = 0 /* previous non-whitespace code */
		
		var counter = 0 /* count sequence termination */
		var context = 0 /* track current context */
		var atrule = 0 /* track @at-rule context */
		var pseudo = 0 /* track pseudo token index */
		var caret = 0 /* current character index */
		var format = 0 /* control character formating context */
		var insert = 0 /* auto semicolon insertion */
		var invert = 0 /* inverted selector pattern */
		var length = 0 /* generic length address */
		var eof = body.length /* end of file(length) */
		var eol = eof - 1 /* end of file(characters) */

		var char = '' /* current character */
		var chars = '' /* current buffer of characters */
		var child = '' /* next buffer of characters */
		var out = '' /* compiled body */
		var children = '' /* compiled children */
		var flat = '' /* compiled leafs */
		var selector /* generic selector address */
		var result /* generic address */

		// ...build body
		while (caret < eof) {
			code = body.charCodeAt(caret)

			if (comment + quote + parentheses + bracket === 0) {
				// eof varient
				if (caret === eol) {
					if (format > 0) {
						chars = chars.replace(formatptn, '')
					}

					if ((chars = chars.trim()).length > 0) {
						switch (code) {
							case SPACE:
							case TAB:
							case SEMICOLON:
							case CARRIAGE:
							case NEWLINE: {
								break
							}
							default: {
								chars += body.charAt(caret)
							}
						}

						code = SEMICOLON
					}
				}

				// auto semicolon insertion
				if (insert === 1) {
					switch (code) {
						// false flags
						case OPENBRACES:
						case COMMA: {
							insert = 0
							break
						}
						// ignore
						case TAB:
						case CARRIAGE:
						case NEWLINE:
						case SPACE: {
							break
						}
						// valid
						default: {
							caret--
							code = SEMICOLON
						}
					}
				}

				// token varient
				switch (code) {
					case OPENBRACES: {
						chars = chars.trim()
						first = chars.charCodeAt(0)
						counter = 1
						caret++

						while (caret < eof) {
							code = body.charCodeAt(caret)

							switch (code) {
								case OPENBRACES: {
									counter++
									break
								}
								case CLOSEBRACES: {
									counter--
									break
								}
							}

							if (counter === 0) {
								break
							}

							child += body.charAt(caret++)
						}

						if (first === NULL) {
							first = (chars = chars.replace(nullptn, '').trim()).charCodeAt(0)
						}

						switch (first) {
							// @at-rule
							case AT: {
								if (format > 0) {
									chars = chars.replace(formatptn, '')
								}

								second = chars.charCodeAt(1)

								switch (second) {
									case DOCUMENT:
									case MEDIA:
									case SUPPORTS: {
										selector = current
										break
									}
									default: {
										selector = array
									}
								}

								child = compile(current, selector, child, second)
								length = child.length

								// preserve empty @at-rule
								if (preserve > 0 && length === 0) {
									length = chars.length
								}

								// execute plugins, @at-rule context
								if (plugged > 0) {
									selector = select(array, chars, invert)
									result = proxy(ATRUL, child, selector, current, line, column, length, second)
									chars = selector.join('')

									if (result !== void 0) {
										if ((length = (child = result.trim()).length) === 0) {
											second = 0
											child = ''
										}
									}
								}

								if (length > 0) {
									switch (second) {
										case DOCUMENT:
										case MEDIA:
										case SUPPORTS: {
											child = chars + '{' + child + '}'
											break
										}
										case KEYFRAME: {
											chars = chars.replace(keyframeptn, '$1 $2' + (keyed > 0 ? key : ''))
											child = chars + '{' + child + '}'
											child = '@' + (vendor > 0 ? webkit + child + '@' + child : child)
											break
										}
										default: {
											child = chars + child
										}
									}
								} else {
									child = ''
								}

								break
							}
							// selector
							default: {
								child = compile(current, select(current, chars, invert), child, id)
							}
						}

						children += child

						// reset
						context = 0
						insert = 0
						pseudo = 0
						format = 0
						invert = 0
						atrule = 0
						chars = ''
						child = ''

						code = body.charCodeAt(++caret)
						break
					}
					case CLOSEBRACES:
					case SEMICOLON: {
						chars = (format > 0 ? chars.replace(formatptn, '') : chars).trim()
						
						if (code !== CLOSEBRACES || chars.length > 0) {
							// monkey-patch missing colon
							if (pseudo === 0) {
								first = chars.charCodeAt(0)

								// first character is a letter or dash, buffer has a space character
								if ((first === DASH || first > 96 && first < 123) && chars.indexOf(' ')) {
									chars = chars.replace(' ', ': ')
								}
							}

							// execute plugins, property context
							if (plugged > 0) {
								if ((result = proxy(PROPS, chars, current, parent, line, column, out.length, id)) !== void 0) {
									if ((chars = result.trim()).length === 0) {
										chars = '\0\0'
									}
								}
							}

							first = chars.charCodeAt(0)
							second = chars.charCodeAt(1)

							switch (first + second) {
								case NULL: {
									break
								}
								case IMPORT:
								case CHARSET: {
									flat += chars + body.charAt(caret)
									break
								}
								default: {
									out += pseudo > 0 ? property(chars, first, second, chars.charCodeAt(2)) : chars + ';'
								}
							}
						}

						// reset
						context = 0
						insert = 0
						pseudo = 0
						format = 0
						invert = 0
						chars = ''

						caret++
						break
					}
				}
			}

			// parse characters
			switch (code) {
				case CARRIAGE:
				case NEWLINE: {
					// auto insert semicolon
					if (comment + quote + parentheses + bracket + semicolon === 0) {
						// valid non-whitespace characters that
						// may precede a newline
						switch (peak) {
							case AT:
							case TILDE:
							case GREATERTHAN:
							case STAR:
							case PLUS:
							case FOWARDSLASH:
							case DASH:
							case COLON:
							case COMMA:
							case SEMICOLON:
							case OPENBRACES:
							case CLOSEBRACES: {
								break
							}
							default: {
								// current buffer has a colon
								if (pseudo > 0) {
									insert = 1
								}
							}
						}
					}

					// terminate line comment
					if (comment === FOWARDSLASH) {
						comment = 0
					}

					// execute plugins, newline context
					if (plugged * unkwn > 0) {
						proxy(UNKWN, chars, current, parent, line, column, out.length, id)
					}

					// next line, reset column position
					column = 1
					line++

					break
				}
				default: {
					// increment column position
					column++

					// current character
					char = body.charAt(caret)

					if (code === TAB && quote === 0) {
						switch (tail) {
							case TAB:
							case SPACE: {
								char = ''
								break
							}
							default: {
								char = parentheses === 0 ? '' : ' '
							}
						}
					}
						
					// remove comments, escape functions, strings, attributes and prepare selectors
					switch (code) {
						// escape breaking control characters
						case NULL: {
							char = '\\0'
							break
						}
						case FORMFEED: {
							char = '\\f'
							break
						}
						case VERTICALTAB: {
							char = '\\v'
							break
						}
						// &
						case AND: {
							// inverted selector pattern i.e html &
							if (quote + comment + bracket === 0 && cascade > 0) {
								invert = 1
								format = 1
								char = '\f' + char
							}
							break
						}
						// ::p<l>aceholder, l
						// :read-on<l>y, l
						case 108: {
							if (quote + comment + bracket + pattern === 0 && pseudo > 0) {
								switch (caret - pseudo) {
									// ::placeholder
									case 2: {
										if (tail === PLACEHOLDER && body.charCodeAt(caret-3) === COLON) {
											pattern = tail
										}
									}
									// :read-only
									case 8: {
										if (trail === READONLY) {
											pattern = trail
										}
									}
								}
							}
							break
						}
						// :<pattern>
						case COLON: {
							if (quote + comment + bracket === 0) {
								pseudo = caret
							}
							break
						}
						// selectors
						case COMMA: {
							if (comment + parentheses + quote + bracket === 0) {
								format = 1
								char += '\r'
							}
							break
						}
						// quotes
						case DOUBLEQUOTE: {
							if (comment === 0) {
								quote = quote === code ? 0 : (quote === 0 ? code : quote)
								// " last character, add synthetic padding
								if (caret === eol) {
									eol++
									eof++
								}
							}
							break
						}
						case SINGLEQUOTE: {
							if (comment === 0) {
								quote = quote === code ? 0 : (quote === 0 ? code : quote)
								// ' last character, add synthetic padding
								if (caret === eol) {
									eol++
									eof++
								}
							}
							break
						}
						// attributes
						case OPENBRACKET: {
							if (quote + comment + parentheses === 0) {
								bracket++
							}
							break
						}
						case CLOSEBRACKET: {
							if (quote + comment + parentheses === 0) {
								bracket--
							}
							break
						}
						// functions
						case CLOSEPARENTHESES: {
							if (quote + comment + bracket === 0) {
								// ) last character, add synthetic padding
								if (caret === eol) {
									eol++
									eof++
								}

								parentheses--
							}
							break
						}
						case OPENPARENTHESES: {
							if (quote + comment + bracket === 0) {
								if (context === 0) {
									switch (tail*2 + trail*3) {
										// :matches
										case 533: {
											break
										}
										// :global, :not, :nth-child etc...
										default: {
											counter = 0
											context = 1
										}
									}
								}

								parentheses++
							}
							break
						}
						case AT: {
							if (comment + parentheses + quote + bracket + pseudo + atrule === 0) {
								atrule = 1
							}
							break
						}
						// block/line comments
						case STAR:
						case FOWARDSLASH: {
							if (quote + bracket + parentheses > 0) {
								break
							}

							switch (comment) {
								// initialize line/block comment context
								case 0: {
									switch (code*2 + body.charCodeAt(caret+1)*3) {
										// //
										case 235: {
											comment = FOWARDSLASH
											break
										}
										// /*
										case 220: {
											comment = STAR
											break
										}
									}
									break
								}
								// end block comment context
								case STAR: {
									if (code === FOWARDSLASH && tail === STAR) {
										char = ''
										comment = 0
									}
								}
							}
						}
					}

					// ignore comment blocks
					if (comment === 0) {
						// aggressive isolation mode, divide each individual selector
						// including selectors in :not function but excluding selectors in :global function
						if (cascade + quote + bracket + atrule === 0 && id !== KEYFRAME && code !== SEMICOLON) {
							switch (code) {
								case COMMA:
								case TILDE:
								case GREATERTHAN:
								case PLUS:
								case CLOSEPARENTHESES:
								case OPENPARENTHESES: {
									if (context === 0) {
										// outside of an isolated context i.e nth-child(<...>)
										switch (tail) {
											case TAB:
											case SPACE:
											case NEWLINE:
											case CARRIAGE: {
												char = char + '\0'
												break
											}
											default: {
												char = '\0' + char + (code === COMMA ? '' : '\0')
											}
										}
										format = 1
									} else {
										// within an isolated context, sleep untill it's terminated
										switch (code) {
											case OPENPARENTHESES: {
												context = ++counter
												break
											}
											case CLOSEPARENTHESES: {
												if ((context = --counter) === 0) {
													format = 1
													char += '\0'
												}
												break
											}
										}
									}
									break
								}
								case SPACE: {
									switch (tail) {
										case NULL:
										case OPENBRACES:
										case CLOSEBRACES:
										case SEMICOLON:
										case COMMA:
										case FORMFEED:
										case TAB:
										case SPACE:
										case NEWLINE:
										case CARRIAGE: {
											break
										}
										default: {
											// ignore in isolated contexts
											if (context === 0) {
												format = 1
												char += '\0'
											}
										}
									}
								}
							}
						}

						// concat buffer of characters
						chars += char

						// previous non-whitespace character code
						if (code !== SPACE) {
							peak = code
						}
					}
				}
			}

			// tail character codes
			trail = tail
			tail = code

			// visit every character
			caret++
		}

		length = out.length

		// preserve empty selector
 		if (preserve > 0) {
 			if (length === 0 && children.length === 0 && (current[0].length === 0) === false) {
 				if (id !== MEDIA || (current.length === 1 && (cascade > 0 ? nscopealt : nscope) === current[0])) {
					length = current.join(',').length + 2 					
 				}
 			}
		}

		if (length > 0) {
			// cascade isolation mode
			if (cascade === 0 && id !== KEYFRAME) {
				isolate(current)
			}

			// execute plugins, block context
			if (plugged > 0) {
				result = proxy(BLCKS, out, current, parent, line, column, length, id)

				if (result !== void 0 && (out = result).length === 0) {
					return flat + out + children
				}
			}		

			out = current.join(',') + '{' + out + '}'

			if (vendor*pattern > 0) {
				switch (pattern) {
					// ::read-only
					case READONLY: {
						out = out.replace(readonlyptn, ':'+moz+'$1')+out
						break
					}
					// ::placeholder
					case PLACEHOLDER: {
						out = (
							out.replace(plcholdrptn, '::' + webkit + 'input-$1') +
							out.replace(plcholdrptn, '::' + moz + '$1') +
							out.replace(plcholdrptn, ':' + ms + 'input-$1') + out
						)
						break
					}
				}
				pattern = 0
			}
		}

		return flat + out + children
	}

	/**
	 * Select
	 *
	 * @param {Array<string>} parent
	 * @param {string} current
	 * @param {number} invert
	 * @return {Array<string>}
	 */
	function select (parent, current, invert) {
		var selectors = current.trim().split(selectorptn)
		var out = selectors

		var length = selectors.length
		var l = parent.length

		switch (l) {
			// 0-1 parent selectors
			case 0:
			case 1: {
				for (var i = 0, selector = l === 0 ? '' : parent[0] + ' '; i < length; i++) {
					out[i] = scope(selector, out[i], invert, l).trim()
				}
				break
			}
			// >2 parent selectors, nested
			default: {
				for (var i = 0, j = 0, out = []; i < length; i++) {
					for (var k = 0; k < l; k++) {
						out[j++] = scope(parent[k] + ' ', selectors[i], invert, l).trim()
					}
				}
			}
		}

		return out
	}

	/**
	 * Scope
	 *
	 * @param {string} parent
	 * @param {string} current
	 * @param {number} invert
	 * @param {number} level
	 * @return {string}
	 */
	function scope (parent, current, invert, level) {
		var selector = current
		var code = selector.charCodeAt(0)

		// trim leading whitespace
		if (code < 33) {
			code = (selector = selector.trim()).charCodeAt(0)
		}

		switch (code) {
			// &
			case AND: {
				switch (cascade + level) {
					case 0:
					case 1: {
						if (parent.trim().length === 0) {
							break
						}
					}
					default: {
						return selector.replace(andptn, '$1'+parent.trim())
					}
				}
				break
			}
			// :
			case COLON: {
				switch (selector.charCodeAt(1)) {
					// g in :global
					case 103: {
						if (escape > 0 && cascade > 0) {
							return selector.replace(escapeptn, '$1').replace(andptn, '$1'+nscope)
						}
						break
					}
					default: {
						// :hover
						return parent.trim() + selector
					}
				}
			}
			default: {
				// html &
				if (invert*cascade > 0 && selector.indexOf('\f') > 0) {
					return selector.replace(andptn, (parent.charCodeAt(0) === COLON ? '' : '$1')+parent.trim())
				}
			}
		}

		return parent + selector
	}

	/**
	 * Property
	 *
	 * @param {string} input
	 * @param {number} first
	 * @param {number} second
	 * @param {number} third
	 * @return {string}
	 */
	function property (input, first, second, third) {
		var out = input + ';'
		var index = 0
		var hash = (first*2) + (second*3) + (third*4)
		var cache

		// animation: a, n, i characters
		if (hash === 944) {
			out = animation(out)
		} else if (vendor > 0) {
			// vendor prefix
			switch (hash) {
				// color/column, c, o, l
				case 963: {
					// column
					if (out.charCodeAt(5) === 110) {
						out = webkit + out + out
					}
					break
				}
				// appearance: a, p, p
				case 978: {
					out = webkit + out + moz + out + out
					break
				}
				// hyphens: h, y, p
				// user-select: u, s, e
				case 1019:
				case 983: {
					out = webkit + out + moz + out + ms + out + out
					break
				}
				// background/backface-visibility, b, a, c
				case 883: {
					// backface-visibility, -
					if (out.charCodeAt(8) === DASH) {
						out = webkit + out + out
					}
					break
				}
				// flex: f, l, e
				case 932: {
					out = webkit + out + ms + out + out
					break
				}
				// order: o, r, d
				case 964: {
					out = webkit + out + ms + 'flex' + '-' + out + out
					break
				}
				// justify-content, j, u, s
				case 1023: {
					cache = out.substring(out.indexOf(':', 15)).replace('flex-', '')
					out = webkit + 'box-pack' + cache + webkit + out + ms + 'flex-pack' + cache + out
					break
				}
				// display(flex/inline-flex/inline-box): d, i, s
				case 975: {
					index = (out = input).length-10
					cache = (out.charCodeAt(index) === 33 ? out.substring(0, index) : out).substring(8).trim()

					switch (hash = cache.charCodeAt(0) + (cache.charCodeAt(7)|0)) {
						// inline-
						case 203: {
							// inline-box
							if (cache.charCodeAt(8) > 110) {
								out = out.replace(cache, webkit+cache)+';'+out
							}
							break
						}
						// inline-flex
						// flex
						case 207:
						case 102: {
							out = (
								out.replace(cache, webkit+(hash > 102 ? 'inline-' : '')+'box')+';'+
								out.replace(cache, webkit+cache)+';'+
								out.replace(cache, ms+cache+'box')+';'+
								out
							)
						}
					}
					
					out += ';'
					break
				}
				// align-items, align-center, align-self: a, l, i, -
				case 938: {
					if (out.charCodeAt(5) === DASH) {
						switch (out.charCodeAt(6)) {
							// align-items, i
							case 105: {
								cache = out.replace('-items', '')
								out = webkit + out + webkit + 'box-' + cache + ms + 'flex-' + cache + out
								break
							}
							// align-self, s
							case 115: {
								out = webkit + out + ms + 'flex-item-' + out.replace('-self', '') + out
								break
							}
							// align-content
							default: {
								out = webkit + out + ms + 'flex-line-pack' + out.replace('align-content', '') + out
							}
						}
					}
					break
				}
				// cursor, c, u, r
				case 1005: {
					if (cursorptn.test(out)) {
						out = out.replace(colonptn, ': ' + webkit) + out.replace(colonptn, ': ' + moz) + out
					}
					break
				}
				// width: min-content / width: max-content
				case 953: {
					if ((index = out.indexOf('-content', 9)) > 0) {
						// width: min-content / width: max-content
						cache = out.substring(index - 3)
						out = 'width:' + webkit + cache + 'width:' + moz + cache + 'width:' + cache
					}
					break
				}
				// text-size-adjust: t, e, x
				case 1015: {
					if (input.charCodeAt(9) !== DASH) {
						break
					}
				}
				// transform, transition: t, r, a
				case 962: {
					out = webkit + out + (out.charCodeAt(5) === 102 ? ms + out : '') + out

					// transitions
					if (second + third === 211 && out.charCodeAt(13) === 105 && out.indexOf('transform', 10) > 0) {
						out = out.substring(0, out.indexOf(';', 27) + 1).replace(transformptn, '$1' + webkit + '$2') + out
					}

					break
				}
				// writing-mode, w, r, i
				case 1000: {
					cache = out.substring(13).trim()
					index = cache.indexOf('-')+1

					switch (cache.charCodeAt(0)+cache.charCodeAt(index)) {
						// vertical-lr
						case 226: {
							cache = out.replace(writingptn, 'tb')
							break
						}
						// vertical-rl
						case 232: {
							cache = out.replace(writingptn, 'tb-rl')
							break
						}
						// horizontal-tb
						case 220: {
							cache = out.replace(writingptn, 'lr')
							break
						}
						default: {
							return out
						}
					}

					out = webkit+out+ms+cache+out
					break
				}
			}
		}

		return out
	}

	/**
	 * Animation
	 *
	 * @param {string} input
	 * @return {string}
	 */
	function animation (input) {
		var length = input.length
		var index = input.indexOf(':', 9) + 1
		var declare = input.substring(0, index).trim()
		var body = input.substring(index, length-1).trim()
		var out = ''

		// shorthand
		if (input.charCodeAt(9) !== DASH) {
			// split in case of multiple animations
			var list = body.split(animationptn)

			for (var i = 0, index = 0, length = list.length; i < length; index = 0, i++) {
				var value = list[i]
				var items = value.split(propertiesptn)

				while (value = items[index]) {
					var peak = value.charCodeAt(0)

					if (keyed === 1 && (
						// letters
						(peak > AT && peak < 90) || (peak > 96 && peak < 123) || peak === UNDERSCORE ||
						// dash but not in sequence i.e --
						(peak === DASH && value.charCodeAt(1) !== DASH)
					)) {
						// not a number/function
						switch (isNaN(parseFloat(value)) + (value.indexOf('(') !== -1)) {
							case 1: {
								switch (value) {
									// not a valid reserved keyword
									case 'infinite': case 'alternate': case 'backwards': case 'running':
									case 'normal': case 'forwards': case 'both': case 'none': case 'linear':
									case 'ease': case 'ease-in': case 'ease-out': case 'ease-in-out':
									case 'paused': case 'reverse': case 'alternate-reverse': case 'inherit':
									case 'initial': case 'unset': case 'step-start': case 'step-end': {
										break
									}
									default: {
										value += key
									}
								}
							}
						}
					}

					items[index++] = value
				}

				out += (i === 0 ? '' : ',') + items.join(' ')
			}
		} else {
			// animation-name, n
			out += input.charCodeAt(10) === 110 ? body + (keyed === 1 ? key : '') : body
		}

		out = declare + out + ';'

		return vendor > 0 ? webkit + out + out : out
	}

	/**
	 * Isolate
	 *
	 * @param {Array<string>} selectors
	 */
	function isolate (selectors) {
		for (var i = 0, length = selectors.length, padding, element; i < length; i++) {
			// split individual elements in a selector i.e h1 h2 === [h1, h2]
			var elements = selectors[i].split(elementptn)
			var out = ''

			for (var j = 0, size = 0, tail = 0, code = 0, l = elements.length; j < l; j++) {
				// empty element
				if ((size = (element = elements[j]).length) === 0 && l > 1) {
					continue
				}

				tail = out.charCodeAt(out.length-1)
				code = element.charCodeAt(0)
				padding = ''

				if (j !== 0) {
					// determine if we need padding
					switch (tail) {
						case STAR:
						case TILDE:
						case GREATERTHAN:
						case PLUS:
						case SPACE:
						case OPENPARENTHESES:  {
							break
						}
						default: {
							padding = ' '
						}
					}
				}

				switch (code) {
					case AND: {
						element = padding + nscopealt
					}
					case TILDE:
					case GREATERTHAN:
					case PLUS:
					case SPACE:
					case CLOSEPARENTHESES:
					case OPENPARENTHESES: {
						break
					}
					case OPENBRACKET: {
						element = padding + element + nscopealt
						break
					}
					case COLON: {
						switch (element.charCodeAt(1)*2 + element.charCodeAt(2)*3) {
							// :global
							case 530: {
								if (escape > 0) {
									element = padding + element.substring(8, size - 1)
									break
								}
							}
							// :hover, :nth-child(), ...
							default: {
								if (j < 1 || elements[j-1].length < 1) {
									element = padding + nscopealt + element
								}
							}
						}
						break
					}
					case COMMA: {
						padding = ''
					}
					default: {
						if (size > 1 && element.indexOf(':') > 0) {
							element = padding + element.replace(pseudoptn, '$1' + nscopealt + '$2')
						} else {
							element = padding + element + nscopealt
						}
					}
				}

				out += element
			}

			selectors[i] = out.replace(formatptn, '').trim()
		}
	}

	/**
	 * Proxy
	 *
	 * @param {number} context
	 * @param {string} content
	 * @param {Array<string>} selectors
	 * @param {Array<string>} parents
	 * @param {number} line
	 * @param {number} column
	 * @param {number} length
	 * @param {number} id
	 * @return {(string|void|*)}
	 */
	function proxy (context, content, selectors, parents, line, column, length, id) {
		for (var i = 0, out = content, next; i < plugged; i++) {
			switch (next = plugins[i].call(stylis, context, out, selectors, parents, line, column, length, id)) {
				case void 0:
				case false:
				case true:
				case null: {
					break
				}
				default: {
					out = next
				}
			}
		}

		switch (out) {
			case void 0:
			case false:
			case true:
			case null:
			case content: {
				break
			}
			default: {
				return out
			}
		}
	}

	/**
	 * Minify
	 *
	 * @param {(string|*)} output
	 * @return {string}
	 */
	function minify (output) {
		return output
			.replace(formatptn, '')
			.replace(beforeptn, '')
			.replace(afterptn, '$1')
			.replace(tailptn, '$1')
			.replace(whiteptn, ' ')
	}

	/**
	 * Use
	 *
	 * @param {(Array<function(...?)>|function(...?)|number|void)?} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case void 0:
			case null: {
				plugged = plugins.length = 0
				break
			}
			default: {
				switch (plugin.constructor) {
					case Array: {
						for (var i = 0, length = plugin.length; i < length; i++) {
							use(plugin[i])
						}
						break
					}
					case Function: {
						plugins[plugged++] = plugin
						break
					}
					case Boolean: {
						unkwn = !!plugin|0
					}
				}
			}
 		}

 		return use
	}

	/**
	 * Set
	 *
	 * @param {*} options
	 */
	function set (options) {		
		for (var name in options) {
			var value = options[name]
			switch (name) {
				case 'keyframe': keyed = value|0; break
				case 'global': escape = value|0; break
				case 'cascade': cascade = value|0; break
				case 'compress': compress = value|0; break
				case 'prefix': vendor = value|0; break
				case 'semicolon': semicolon = value|0; break
				case 'preserve': preserve = value|0; break
			}
		}

		return set
	}

	/**
	 * Stylis
	 *
	 * @param {string} selector
	 * @param {string} input
	 * @return {*}
	 */
	function stylis (selector, input) {
		if (this !== void 0 && this.constructor === stylis) {
			return factory(selector)
		}

		// setup
		var ns = selector
		var code = ns.charCodeAt(0)

		// trim leading whitespace
		if (code < 33) {
			code = (ns = ns.trim()).charCodeAt(0)
		}

		// keyframe/animation namespace
		if (keyed > 0) {
			key = ns.replace(invalidptn, code === OPENBRACKET ? '' : '-')
		}

		// reset, used to assert if a plugin is moneky-patching the return value
		code = 1

		// cascade/isolate
		if (cascade === 1) {
			nscope = ns
		} else {
			nscopealt = ns
		}

		var selectors = [nscope]
		var result

		// execute plugins, pre-process context
		if (plugged > 0) {
			result = proxy(PREPS, input, selectors, selectors, line, column, 0, 0)

			if (result !== void 0 && typeof result === 'string') {
				input = result
			}
		}

		// build
		var output = compile(array, selectors, input, 0)

		// execute plugins, post-process context
		if (plugged > 0) {
			result = proxy(POSTS, output, selectors, selectors, line, column, output.length, 0)
	
			// bypass minification
			if (result !== void 0 && typeof(output = result) !== 'string') {
				code = 0
			}
		}

		// reset
		key = ''
		nscope = ''
		nscopealt = ''
		pattern = 0
		line = 1
		column = 1

		return compress*code === 0 ? output : minify(output)
	}

	stylis['use'] = use
	stylis['set'] = set

	if (options !== void 0) {
		set(options)
	}

	return stylis
}));


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(27)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(30)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var emptyFunction = __webpack_require__(6);
var invariant = __webpack_require__(7);
var warning = __webpack_require__(13);
var assign = __webpack_require__(28);

var ReactPropTypesSecret = __webpack_require__(8);
var checkPropTypes = __webpack_require__(29);

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (process.env.NODE_ENV !== 'production') {
  var invariant = __webpack_require__(7);
  var warning = __webpack_require__(13);
  var ReactPropTypesSecret = __webpack_require__(8);
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var emptyFunction = __webpack_require__(6);
var invariant = __webpack_require__(7);
var ReactPropTypesSecret = __webpack_require__(8);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    arguments: true,
    arity: true
};

var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {

                }
            }
        }
    }

    return targetComponent;
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var styled_components_1 = __webpack_require__(3);
var linalg_1 = __webpack_require__(1);
var number_aware_compare_1 = __webpack_require__(34);
var fullscreen_1 = __webpack_require__(35);
var HelpScreen_1 = __webpack_require__(36);
var Layer_1 = __webpack_require__(4);
var ImageFrameWithLoading_1 = __webpack_require__(37);
var navigation_1 = __webpack_require__(38);
var MainDiv = (_a = ["\n  background-color: #fff;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"], _a.raw = ["\n  background-color: #fff;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"], styled_components_1.default.div(_a));
var ImageArea = (_b = ["\n  flex-grow: 1;\n  position: relative;\n"], _b.raw = ["\n  flex-grow: 1;\n  position: relative;\n"], styled_components_1.default.div(_b));
// A little hack to allow detecting shift click
var SHIFT_IS_DOWN = false;
document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = true;
    }
});
document.addEventListener('keyup', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = false;
    }
});
var ImageViewer = /** @class */ (function (_super) {
    __extends(ImageViewer, _super);
    function ImageViewer(props) {
        var _this = _super.call(this, props) || this;
        _this.menuData = _this.props.data;
        if (props.sortMenu) {
            _this.menuData = _this.sortMenuRows(_this.menuData);
        }
        // Set the initial state
        _this.state = {
            activeRow: 0,
            selection: _this.getDefaultSelection(_this.menuData).slice(1),
            viewTransform: { default: 0.0 },
            exposure: { default: 1.0 },
            helpIsOpen: false,
            defaultTransformation: linalg_1.Matrix4x4.create(),
            transformationNeedsUpdate: true,
            hasFocus: false,
        };
        // Make sure 'this' is available in the keyboard handler when assigned to the keyup event
        _this.keyboardHandler = _this.keyboardHandler.bind(_this);
        _this.setFocus = _this.setFocus.bind(_this);
        _this.unsetFocus = _this.unsetFocus.bind(_this);
        return _this;
    }
    ImageViewer.prototype.componentDidMount = function () {
        this.mainContainer.setAttribute('tabindex', '1');
        this.mainContainer.addEventListener('keydown', this.keyboardHandler);
        this.mainContainer.addEventListener('focus', this.setFocus);
        this.mainContainer.addEventListener('focusout', this.unsetFocus);
    };
    ImageViewer.prototype.componentDidUpdate = function () {
        if (this.imageFrame && this.state.transformationNeedsUpdate) {
            this.imageFrame.setTransformation(this.state.defaultTransformation);
            this.setState({ transformationNeedsUpdate: false });
        }
    };
    ImageViewer.prototype.componentWillReceiveProps = function (nextProps) {
        this.menuData = nextProps.data;
        if (this.props.sortMenu) {
            this.menuData = this.sortMenuRows(this.menuData);
        }
        this.validateSelection(this.state.selection, this.state.activeRow);
    };
    ImageViewer.prototype.componentWillUnmount = function () {
        this.mainContainer.removeEventListener('keydown', this.keyboardHandler);
    };
    ImageViewer.prototype.setTransformation = function (transformation) {
        if (this.imageFrame != null) {
            this.imageFrame.setTransformation(transformation);
        }
        this.setState({ defaultTransformation: transformation });
    };
    ImageViewer.prototype.render = function () {
        var _this = this;
        var rows = this.activeRows(this.menuData, this.state.selection);
        var imageSpec = this.imageSpec();
        return (React.createElement(MainDiv, { innerRef: function (div) { return _this.mainContainer = div; } },
            React.createElement("div", null, rows.map(function (row, i) { return (React.createElement(navigation_1.NavRow, { key: row.title, row: row, selection: _this.state.selection[i], handleClick: _this.navigateTo.bind(_this, rows, i), removeCommonPrefix: _this.props.removeCommonPrefix, active: _this.state.activeRow === i })); })),
            React.createElement(ImageArea, null,
                React.createElement(ImageFrameWithLoading_1.default, { viewTransform: this.state.viewTransform[imageSpec.tonemapGroup], exposure: this.state.exposure[imageSpec.tonemapGroup] || 1.0, gamma: 1.0, offset: 0.0, imageSpec: imageSpec, ref: function (frame) { return _this.imageFrame = (frame != null) ? frame.imageFrame : null; }, allowMovement: true, enableMouseEvents: this.state.hasFocus }),
                this.state.helpIsOpen ? React.createElement(HelpScreen_1.default, null) : null)));
    };
    /**
     * Select the active rows from the navigation data tree, according to the given selection
     *
     * @param tree navigation datastructure
     * @param selection array of the titles of selected items from top to bottom
     */
    ImageViewer.prototype.activeRows = function (tree, selection) {
        if (selection.length === 0) {
            // Base case of the recursion
            return [];
        }
        else {
            // Find the child with this name
            if (!tree.hasOwnProperty('children')) {
                throw new Error("Can't find match for " + selection);
            }
            var node = tree;
            var res = node.children.find(function (child) { return child.title === selection[0]; });
            if (res == null) {
                throw new Error("Failed to find a match for " + selection);
            }
            else {
                return [node].concat(this.activeRows(res, selection.slice(1)));
            }
        }
    };
    /**
     * Recursively sort the input data
     *
     * It's a bit smart, for example bathroom-32 will come before bathroom-128,
     * and the word Color always goes first.
     * @param tree to be sored
     */
    ImageViewer.prototype.sortMenuRows = function (tree) {
        var _this = this;
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            var children = node.children.map(function (child) { return _this.sortMenuRows(child); });
            children.sort(function (a, b) {
                if (a.title === b.title) {
                    return 0;
                }
                else if (a.title === 'Color') {
                    return -1;
                }
                else if (b.title === 'Color') {
                    return 1;
                }
                else {
                    return number_aware_compare_1.default(a.title, b.title);
                }
            });
            return {
                title: node.title,
                children: children,
            };
        }
        else {
            return tree;
        }
    };
    /**
     * Find the image to be shown based on the current selection
     */
    ImageViewer.prototype.currentImage = function (currentSelection) {
        if (currentSelection === void 0) { currentSelection = this.state.selection; }
        var selection = currentSelection.slice();
        var tree = this.menuData;
        var _loop_1 = function () {
            var entry = selection.shift();
            tree = tree.children.find(function (item) { return item.title === entry; });
        };
        while (selection.length > 0) {
            _loop_1();
        }
        return tree; // tslint:disable-line
    };
    /**
     * Specification for the current image to load
     */
    ImageViewer.prototype.imageSpec = function (currentSelection) {
        if (currentSelection === void 0) { currentSelection = this.state.selection; }
        var img = this.currentImage(currentSelection);
        if (img.hasOwnProperty('lossMap')) {
            var config = img;
            return {
                type: 'Difference',
                lossFunction: Layer_1.lossFunctionFromString(config.lossMap.function),
                urlA: this.props.baseUrl + config.lossMap.imageA,
                urlB: this.props.baseUrl + config.lossMap.imageB,
                tonemapGroup: config.tonemapGroup || 'default',
            };
        }
        else {
            return {
                type: 'Url',
                url: this.props.baseUrl + img.image,
                tonemapGroup: img.tonemapGroup || 'default',
            };
        }
    };
    /**
     * Navigate to a particular image
     *
     * @param rows: a list of the rows currently visible
     * @param rowIndex: the index of the row in which to switch tabs
     * @param title: the title of the requested node
     *
     * For rows > rowIndex, we select children matching the current selection titles
     * if they exist. Otherwise, we resort to the default selection (first elements).
     */
    ImageViewer.prototype.navigateTo = function (rows, rowIndex, title) {
        var selection = this.state.selection.slice();
        selection[rowIndex] = title;
        var activeRow = this.state.activeRow;
        if (SHIFT_IS_DOWN) {
            // Set active row on shift click
            activeRow = rowIndex;
        }
        this.validateSelection(selection, activeRow);
    };
    /**
     * Make sure that the current selection is valid given the current menuData
     *
     * If a title in the selection does not exist in the respective row, take the default
     * (first) element of the row.
     * @param wishes the desired selection, which might not be valid given the selected menu items
     */
    ImageViewer.prototype.validateSelection = function (wishes, activeRow) {
        var selection = [];
        var i = 0;
        var root = this.menuData;
        while (root.hasOwnProperty('children')) {
            var candidate = root.children.find(function (row) { return row.title === wishes[i]; });
            if (candidate) {
                root = candidate;
                selection.push(candidate.title);
            }
            else {
                root = root.children[0]; // resort to the first
                selection.push(root.title);
            }
            i++;
        }
        this.setState({
            selection: selection,
            activeRow: Math.min(activeRow, selection.length - 1),
        });
    };
    /**
     * Return the titles of the first items of a sorted tree
     * @param tree a sorted navigation data structure
     */
    ImageViewer.prototype.getDefaultSelection = function (tree) {
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            if (node.children.length > 0) {
                return [node.title].concat(this.getDefaultSelection(node.children[0]));
            }
            else {
                return [node.title];
            }
        }
        else {
            return [tree.title];
        }
    };
    ImageViewer.prototype.dumpTransformation = function () {
        if (this.imageFrame != null) {
            var transformation = this.imageFrame.getTransformation();
            console.log(transformation.data);
        }
    };
    ImageViewer.prototype.keyboardHandler = function (event) {
        var _this = this;
        var key = event.key;
        var actions = {};
        var actionsUnderShift = {};
        // Number keys
        var goToNumber = function (i) { return function () {
            var rows = _this.activeRows(_this.menuData, _this.state.selection);
            var activeRow = _this.state.activeRow;
            var goTo = rows[activeRow].children[i];
            if (goTo != null) {
                _this.navigateTo(rows, activeRow, goTo.title);
            }
        }; };
        actions['0'] = goToNumber(9);
        for (var i = 1; i <= 9; ++i) {
            actions[i.toString()] = goToNumber(i - 1);
        }
        // Arrows
        var moveInLine = function (offset) { return function () {
            var rows = _this.activeRows(_this.menuData, _this.state.selection);
            var activeRow = _this.state.activeRow;
            var currentTitle = _this.state.selection[activeRow];
            var currentIndex = rows[activeRow].children.findIndex(function (n) { return n.title === currentTitle; });
            var nextIndex = (currentIndex + offset + rows[activeRow].children.length) % rows[activeRow].children.length;
            var goTo = rows[activeRow].children[nextIndex];
            _this.navigateTo(rows, activeRow, goTo.title);
        }; };
        actionsUnderShift.ArrowLeft = moveInLine(-1);
        actionsUnderShift.ArrowRight = moveInLine(1);
        actions['-'] = moveInLine(-1);
        actions['='] = moveInLine(1);
        var moveUpDown = function (offset) { return function () {
            var nextRow = _this.state.activeRow + offset;
            if (nextRow < 0) {
                nextRow = 0;
            }
            if (nextRow >= _this.state.selection.length - 1) {
                nextRow = _this.state.selection.length - 1;
            }
            _this.setState({ activeRow: nextRow });
        }; };
        actionsUnderShift.ArrowUp = moveUpDown(-1);
        actionsUnderShift.ArrowDown = moveUpDown(1);
        actions['['] = moveUpDown(-1);
        actions[']'] = moveUpDown(1);
        // ViewTransform controls
        var changeViewTransform = function () { return function () {
            var tonemapGroup = _this.imageSpec().tonemapGroup;
            var viewTransform = __assign({}, _this.state.viewTransform, (_a = {}, _a[tonemapGroup] = (Math.abs(_this.state.viewTransform[tonemapGroup] - 1)), _a));
            _this.setState({ viewTransform: viewTransform });
            var _a;
        }; };
        actions.t = changeViewTransform();
        // Exposure controls
        var changeExposure = function (multiplier) { return function () {
            var tonemapGroup = _this.imageSpec().tonemapGroup;
            var exposure = __assign({}, _this.state.exposure, (_a = {}, _a[tonemapGroup] = multiplier * (_this.state.exposure[tonemapGroup] || 1.0), _a));
            _this.setState({ exposure: exposure });
            var _a;
        }; };
        actions.e = changeExposure(1.1);
        actions.E = changeExposure(1.0 / 1.1);
        // Reset
        actions.r = function () {
            _this.setState({ viewTransform: { default: 0.0 } });
            _this.setState({ exposure: { default: 1.0 } });
            if (_this.imageFrame) {
                _this.imageFrame.reset();
            }
        };
        // Toggle help
        actions['/'] = actions['?'] = function () {
            _this.setState({ helpIsOpen: !_this.state.helpIsOpen });
        };
        actions.Escape = function () {
            _this.setState({ helpIsOpen: false });
        };
        // Go fullscreen
        actions.f = function () { return fullscreen_1.default(_this.mainContainer); };
        // Dump the current transformation
        actions.d = function () { return _this.dumpTransformation(); };
        if (actions.hasOwnProperty(key) && !event.metaKey && !event.altKey && !event.ctrlKey) {
            event.preventDefault();
            actions[key]();
            return;
        }
        if (actionsUnderShift.hasOwnProperty(key) && event.shiftKey) {
            event.preventDefault();
            actionsUnderShift[key]();
            return;
        }
    };
    ImageViewer.prototype.setFocus = function () {
        this.setState({ hasFocus: true });
    };
    ImageViewer.prototype.unsetFocus = function () {
        this.setState({ hasFocus: false });
    };
    ImageViewer.defaultProps = {
        baseUrl: '',
        sortMenu: false,
        removeCommonPrefix: false,
    };
    return ImageViewer;
}(React.Component));
exports.default = ImageViewer;
var _a, _b;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var splitPartsPattern = /\d+|\D+/g;
function numberAwareCompare(a, b) {
    var aComponents = a.match(splitPartsPattern) || [];
    var bComponents = b.match(splitPartsPattern) || [];
    while (aComponents.length > 0 && bComponents.length > 0) {
        var currentA = aComponents.shift();
        var currentB = bComponents.shift();
        var aAsInteger = parseInt(currentA, 10);
        var bAsInteger = parseInt(currentB, 10);
        if (!isNaN(aAsInteger) && !isNaN(bAsInteger)) {
            // Compare integers
            if (aAsInteger < bAsInteger) {
                return -1;
            }
            else if (aAsInteger > bAsInteger) {
                return 1;
            }
        }
        else if (isNaN(aAsInteger) && isNaN(bAsInteger)) {
            // Compare non-integer strings
            if (currentA < currentB) {
                return -1;
            }
            else if (currentA > currentB) {
                return 1;
            }
        }
        else {
            // If one block is an integer and the other a string,
            // the number is smaller
            if (isNaN(bAsInteger)) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    if (aComponents.length === 0 && bComponents.length === 0) {
        return 0;
    }
    else if (aComponents.length === 0) {
        return -1;
    }
    else {
        return 1;
    }
}
exports.default = numberAwareCompare;
// console.log(numberAwareCompare("bathroom10", "bathroom2"), 1)
// console.log(numberAwareCompare("bathroom2", "bathroom10"), -1)
// console.log(numberAwareCompare("2bathroom", "10bathroom"), -1)
// console.log(numberAwareCompare("10bathroom", "2bathroom"), 1)
// console.log(numberAwareCompare("1bathroom", "bathroom1"), -1)
// console.log(numberAwareCompare("bathroom1", "1bathroom"), 1)
// console.log(numberAwareCompare("bla", "bla"), 0)
// console.log(numberAwareCompare("bla1", "bla1"), 0)
// console.log(numberAwareCompare("bla1a4", "bla1a4"), 0)
// console.log(numberAwareCompare("", ""), 0)
// console.log(numberAwareCompare("a", ""), 1)
// console.log(numberAwareCompare("", "a"), -1)
// console.log(numberAwareCompare("2017.07.14", "2017.07.13"), 1)
// console.log(numberAwareCompare("bathroom-1", "bathroom1"), 1)


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); //tslint:disable-line
    }
}
exports.default = requestFullscreen;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var styled_components_1 = __webpack_require__(3);
var HelpScreenDiv = (_a = ["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 2em 0;\n  background-color: rgba(0, 0, 0, 0.8);\n  line-height: 1.4em;\n  color: white;\n  table {\n    width: 40em;\n    margin: 0 auto;\n  }\n  h1 {\n    font-size: 1em;\n    margin: 0;\n    padding: 0;\n    line-height: 2em;\n    text-align: center;\n    padding-bottom: .5em;\n  }\n  th, td {\n    text-align: left;\n    padding: .4em 1em;\n    vertical-align: top;\n  }\n  th {\n    width: 10em;\n  }\n"], _a.raw = ["\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 2em 0;\n  background-color: rgba(0, 0, 0, 0.8);\n  line-height: 1.4em;\n  color: white;\n  table {\n    width: 40em;\n    margin: 0 auto;\n  }\n  h1 {\n    font-size: 1em;\n    margin: 0;\n    padding: 0;\n    line-height: 2em;\n    text-align: center;\n    padding-bottom: .5em;\n  }\n  th, td {\n    text-align: left;\n    padding: .4em 1em;\n    vertical-align: top;\n  }\n  th {\n    width: 10em;\n  }\n"], styled_components_1.default.div(_a));
exports.default = function () {
    return (React.createElement(HelpScreenDiv, null,
        React.createElement("h1", null, "Shortcuts"),
        React.createElement("table", null,
            React.createElement("tbody", null,
                React.createElement("tr", null,
                    React.createElement("th", null, "0-9"),
                    React.createElement("td", null, "Switch images")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + 0-9"),
                    React.createElement("td", null, "Switch comparison (to for example reference or input)")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + Arrows"),
                    React.createElement("td", null, "Navigate through the menu")),
                React.createElement("tr", null,
                    React.createElement("th", null, "Shift + click"),
                    React.createElement("td", null, "Open a tab, and activate keyboard shortcuts for the row clicked")),
                React.createElement("tr", null,
                    React.createElement("th", null, "e / E"),
                    React.createElement("td", null,
                        "Increase / decrease ",
                        React.createElement("strong", null, "e"),
                        "xposure")),
                React.createElement("tr", null,
                    React.createElement("th", null, "r"),
                    React.createElement("td", null, "Reset exposure, view transform, positioning and zooming")),
                React.createElement("tr", null,
                    React.createElement("th", null, "t"),
                    React.createElement("td", null, "Toggle between the Gamma 2.2 and the Pseudo ARRI K1S1 view transforms")),
                React.createElement("tr", null,
                    React.createElement("th", null, "f"),
                    React.createElement("td", null,
                        "Enter ",
                        React.createElement("strong", null, "f"),
                        "ullscreen mode")),
                React.createElement("tr", null,
                    React.createElement("th", null, "?"),
                    React.createElement("td", null, "Toggle this help screen"))))));
};
var _a;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var styled_components_1 = __webpack_require__(3);
var ImageFrame_1 = __webpack_require__(9);
var image_loading_1 = __webpack_require__(5);
var StretchingDiv = (_a = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], _a.raw = ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], styled_components_1.default.div(_a));
var LoadingOverlay = (_b = ["\n  display: block;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: left;\n  padding: .6em;\n  background-color: rgb(64, 64, 64);\n"], _b.raw = ["\n  display: block;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: left;\n  padding: .6em;\n  background-color: rgb(64, 64, 64);\n"], styled_components_1.default.div(_b));
/**
 * A wrapper around ImageFrame that deals with the loading of images
 * It takes an `ImageSpec` instead of an `InputImage`.
 */
var ImageFrameWithLoading = /** @class */ (function (_super) {
    __extends(ImageFrameWithLoading, _super);
    function ImageFrameWithLoading(props) {
        var _this = _super.call(this, props) || this;
        _this.cache = new image_loading_1.ImageCache();
        _this.requestId = 0;
        // Counter to ensure that returning downloads are still relevant to the current app state.
        _this.currentRequest = 0;
        _this.state = {
            isLoading: false,
            errorMsg: null,
            image: null,
        };
        _this.handleImageChange(props, false);
        return _this;
    }
    ImageFrameWithLoading.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.imageSpec !== this.props.imageSpec) {
            this.handleImageChange(nextProps);
        }
    };
    ImageFrameWithLoading.prototype.componentWillUnmount = function () {
        // Don't handle any returning downloads anymore after unmount.
        this.requestId = -1;
    };
    ImageFrameWithLoading.prototype.render = function () {
        var _this = this;
        return (React.createElement(StretchingDiv, null,
            this.state.image != null ?
                React.createElement(ImageFrame_1.default, { viewTransform: this.props.viewTransform, exposure: this.props.exposure, gamma: this.props.gamma, offset: this.props.offset, image: this.state.image, ref: function (frame) { return _this.imageFrame = frame; }, allowMovement: this.props.allowMovement, enableMouseEvents: this.props.enableMouseEvents })
                : null,
            this.state.isLoading ? React.createElement(LoadingOverlay, null, "Downloading ...") : null,
            this.state.errorMsg ? React.createElement(LoadingOverlay, null, this.state.errorMsg) : null));
    };
    /**
     * Initiate the download of the current spec.
     * Sets the state in case of correct or incorrect loads.
     */
    ImageFrameWithLoading.prototype.handleImageChange = function (props, shouldSetLoadingState) {
        var _this = this;
        if (shouldSetLoadingState === void 0) { shouldSetLoadingState = true; }
        this.currentRequest++;
        var handledRequest = this.currentRequest;
        if (shouldSetLoadingState) {
            this.setState({
                isLoading: true,
                errorMsg: null,
            });
        }
        this.downloadImage(props.imageSpec)
            .then(function (image) {
            if (handledRequest !== _this.currentRequest) {
                // This download does not correspond to the latest request, so should not be shown.
                return;
            }
            _this.setState({
                errorMsg: null,
                isLoading: false,
                image: image,
            });
        })
            .catch(function (error) {
            if (handledRequest !== _this.requestId) {
                // This download does not correspond to the latest request, so should not be shown.
                return;
            }
            _this.setState({
                errorMsg: error.message,
                isLoading: false,
            });
        });
    };
    /**
     * Download an image
     * @param image specification of the image to download (url or difference of two images)
     * @return Promise of a loaded image
     */
    ImageFrameWithLoading.prototype.downloadImage = function (spec) {
        var _this = this;
        if (spec.type === 'Url') {
            return this.cache.get(spec.url);
        }
        else if (spec.type === 'Difference') {
            return Promise.all([spec.urlA, spec.urlB].map(function (url) { return _this.cache.get(url); }))
                .then(function (_a) {
                var imageA = _a[0], imageB = _a[1];
                // Make sure images have the same size and number of channels;
                var height = imageA.height;
                var width = imageA.width;
                var nChannels = imageA.nChannels;
                if (height !== imageB.height) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with heights " + height + " & " + imageB.height + " cannot be compared.");
                }
                if (width !== imageB.width) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with widths " + width + " & " + imageB.width + " cannot be compared.");
                }
                if (nChannels !== imageB.nChannels) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with unequal nChannels " + nChannels + " & " + imageB.nChannels + ".");
                }
                return {
                    type: spec.type,
                    imageA: imageA,
                    imageB: imageB,
                    width: width,
                    height: height,
                    nChannels: nChannels,
                    lossFunction: spec.lossFunction,
                };
            });
        }
        else {
            throw Error("Unkonwn imageSpec type for " + spec + ".");
        }
    };
    return ImageFrameWithLoading;
}(React.Component));
exports.default = ImageFrameWithLoading;
var _a, _b;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(0);
var styled_components_1 = __webpack_require__(3);
var commonPrefix = __webpack_require__(39);
/** Helper to reverse string */
var reverse = function (x) { return x.split('').reverse().join(''); };
// tslint:disable
var NavLink = (_a = ["\n  cursor: pointer;\n  display: inline-block;\n  margin: 0;\n  flex-grow: 0;\n  flex-shrink: ", ";\n  padding: .4em .7em;\n  overflow: hidden;\n  text-decoration: none;\n  white-space: nowrap;\n  position: relative;\n  background-color: ", ";\n  color: ", ";\n  &:active {\n    background-color: ", ";\n  }\n  &:hover {\n    flex-shrink: 0;\n  }\n  user-select: none;\n  -moz-user-select: none;\n"], _a.raw = ["\n  cursor: pointer;\n  display: inline-block;\n  margin: 0;\n  flex-grow: 0;\n  flex-shrink: ", ";\n  padding: .4em .7em;\n  overflow: hidden;\n  text-decoration: none;\n  white-space: nowrap;\n  position: relative;\n  background-color: ", ";\n  color: ", ";\n  &:active {\n    background-color: ", ";\n  }\n  &:hover {\n    flex-shrink: 0;\n  }\n  user-select: none;\n  -moz-user-select: none;\n"], styled_components_1.default.a(_a, function (props) { return props.active ? '0' : '1'; }, function (props) { return props.active ? '#238' : 'inherit'; }, function (props) { return props.active ? '#FFFFFF !important' : '#AAA !important'; }, function (props) { return props.active ? '#666' : '#fff'; }));
// tslint:enable
var NavRowDiv = (_b = ["\n  display: block;\n  padding: 0;\n  border-bottom: 1px solid #aaa;\n  background: #fff;\n  color: #111;\n  display: flex;\n  &:first-child {\n//    border-top: 1px solid #aaa;\n  }\n  &:hover ", " {\n    flex-shrink: 1;\n  }\n  &:hover ", ":hover {\n    flex-shrink: 0;\n  }\n"], _b.raw = ["\n  display: block;\n  padding: 0;\n  border-bottom: 1px solid #aaa;\n  background: #fff;\n  color: #111;\n  display: flex;\n  &:first-child {\n//    border-top: 1px solid #aaa;\n  }\n  &:hover ", " {\n    flex-shrink: 1;\n  }\n  &:hover ", ":hover {\n    flex-shrink: 0;\n  }\n"], styled_components_1.default.div(_b, NavLink, NavLink));
var NavLinkNumber = (_c = ["\n  color: white;\n  font-size: .6em;\n  position: absolute;\n  top: .3em;\n  right: .4em;\n"], _c.raw = ["\n  color: white;\n  font-size: .6em;\n  position: absolute;\n  top: .3em;\n  right: .4em;\n"], styled_components_1.default.span(_c));
exports.NavRow = function (_a) {
    var row = _a.row, active = _a.active, selection = _a.selection, handleClick = _a.handleClick, removeCommonPrefix = _a.removeCommonPrefix;
    var titlesInRow = row.children.map(function (child) { return child.title; });
    // Trim common prefices and suffices from the row's entries
    var trimmedTitles;
    if (removeCommonPrefix) {
        var prefix_1 = commonPrefix(titlesInRow);
        var suffix_1 = reverse(commonPrefix(titlesInRow.map(reverse)));
        trimmedTitles = titlesInRow.map(function (t) { return t.slice(prefix_1.lastIndexOf('/') + 1, t.length - suffix_1.length); });
    }
    else {
        trimmedTitles = titlesInRow;
    }
    return (React.createElement(NavRowDiv, null, row.children.map(function (child, i) { return (React.createElement(NavLink, { onClick: function () { return handleClick(child.title); }, key: child.title, active: child.title === selection },
        i === 0 ? titlesInRow[i] : trimmedTitles[i],
        active && i < 10 ? React.createElement(NavLinkNumber, null, (i + 1) % 10) : null)); })));
};
var _a, _b, _c;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = common

function common (strings) {
  if (!Array.isArray(strings)) {
    throw new Error('common-prefix expects an array of strings')
  }

  var first = strings[0] || ''
  var commonLength = first.length

  for (var i = 1; i < strings.length; ++i) {
    for (var j = 0; j < commonLength; ++j) {
      if (strings[i].charAt(j) !== first.charAt(j)) {
        commonLength = j
        break
      }
    }
  }

  return first.slice(0, commonLength)
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=jeri.js.map