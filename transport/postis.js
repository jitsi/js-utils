/* eslint-disable */

import { safeJsonParse } from '../json.js';

// Originally: https://github.com/adtile/postis
//
// The MIT License
// 
// Copyright (c) 2015-2015 Adtile Technologies Inc. http://www.adtile.me
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function Postis(options) {
  var scope = options.scope;
  var targetWindow = options.window;
  var windowForEventListening = options.windowForEventListening || window;
  var allowedOrigin = options.allowedOrigin;
  var listeners = {};
  var sendBuffer = [];
  var listenBuffer = {};
  var ready = false;
  var readyMethod = "__ready__";
  var readynessCheck;

  var listener = function(event) {
    var data;
    try {
      data = safeJsonParse(event.data);
    } catch (e) {
      return;
    }

    if (allowedOrigin && event.origin !== allowedOrigin) {
        return;
    }

    if (data && data.postis && data.scope === scope) {
      var listenersForMethod = listeners[data.method];
      if (listenersForMethod) {
        for (var i = 0; i < listenersForMethod.length; i++) {
          listenersForMethod[i].call(null, data.params);
        }
      } else {
        listenBuffer[data.method] = listenBuffer[data.method] || [];
        listenBuffer[data.method].push(data.params);
      }
    }
  };

  windowForEventListening.addEventListener("message", listener, false);

  var postis = {
    listen: function (method, callback) {
      listeners[method] = listeners[method] || [];
      listeners[method].push(callback);

      var listenBufferForMethod = listenBuffer[method];
      if (listenBufferForMethod) {
        var listenersForMethod = listeners[method];
        for (var i = 0; i < listenersForMethod.length; i++) {
          for (var j = 0; j < listenBufferForMethod.length; j++) {
            listenersForMethod[i].call(null, listenBufferForMethod[j]);
          }
        }
      }
      delete listenBuffer[method];
    },

    send: function (opts) {
      var method = opts.method;

      if ((ready || opts.method === readyMethod) && (targetWindow && typeof targetWindow.postMessage === "function")) {
        targetWindow.postMessage(JSON.stringify({
          postis: true,
          scope: scope,
          method: method,
          params: opts.params
        }), "*");
      } else {
        sendBuffer.push(opts);
      }
    },

    ready: function (callback) {
      if (ready) {
        callback();
      } else {
        setTimeout(function () { postis.ready(callback); }, 50);
      }
    },

    destroy: function (callback) {
      clearInterval(readynessCheck);
      ready = false;
      if (windowForEventListening && typeof windowForEventListening.removeEventListener === "function") {
        windowForEventListening.removeEventListener("message", listener);
      }
      callback && callback();
    }
  };

  var readyCheckID = +new Date() + Math.random() + "";

  readynessCheck = setInterval(function () {
    postis.send({
      method: readyMethod,
      params: readyCheckID
    });
  }, 50);

  postis.listen(readyMethod, function (id) {
    if (id === readyCheckID) {
      clearInterval(readynessCheck);
      ready = true;

      for (var i = 0; i < sendBuffer.length; i++) {
        postis.send(sendBuffer[i]);
      }
      sendBuffer = [];
    } else {
      postis.send({
        method: readyMethod,
        params: id
      });
    }
  });

  return postis;
}

export default Postis;
