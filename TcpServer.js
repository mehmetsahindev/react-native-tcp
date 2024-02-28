/**
 * Copyright (c) 2015-present, Peel Technologies, Inc.
 * All rights reserved.
 *
 * @providesModule TcpServer
 * @flow
 */
const util = require("util");
const EventEmitter = require("events").EventEmitter;
const { NativeModules } = require("react-native");
const Sockets = NativeModules.TcpSocketsClass;

const Socket = require("./TcpSocket");

function TcpServer(connectionListener: (socket: Socket) => void) {
  if (!(this instanceof TcpServer)) {
    return new TcpServer(connectionListener);
  }

  if (EventEmitter instanceof Function) {
    EventEmitter.call(this);
  }

  const self = this;

  this._socket = new Socket();

  // $FlowFixMe: suppressing this error flow doesn't like EventEmitter
  this._socket.on("connect", function () {
    self.emit("listening");
  });
  // $FlowFixMe: suppressing this error flow doesn't like EventEmitter
  this._socket.on("connection", function (socket) {
    self._connections++;
    self.emit("connection", socket);
  });
  // $FlowFixMe: suppressing this error flow doesn't like EventEmitter
  this._socket.on("error", function (error) {
    self.emit("error", error);
  });

  if (typeof connectionListener === "function") {
    self.on("connection", connectionListener);
  }

  this._connections = 0;
}

util.inherits(TcpServer, EventEmitter);

TcpServer.prototype._debug = function () {
  if (__DEV__) {
    const args = [].slice.call(arguments);
    console.log.apply(console, args);
  }
};

// TODO : determine how to properly overload this with flow
TcpServer.prototype.listen = function (): TcpServer {
  const args = this._socket._normalizeConnectArgs(arguments);
  const options = args[0];
  const callback = args[1];

  const port = options.port;
  const host = options.host || "0.0.0.0";

  if (callback) {
    this.once("listening", callback);
  }

  this._socket._registerEvents();
  Sockets.listen(this._socket._id, host, port);

  return this;
};

TcpServer.prototype.getConnections = function (
  callback: (err: ?any, count: number) => void
) {
  if (typeof callback === "function") {
    callback.invoke(null, this._connections);
  }
};

TcpServer.prototype.address = function (): {
  port: number,
  address: string,
  family: string,
} {
  return this._socket ? this._socket.address() : {};
};

TcpServer.prototype.close = function (callback: ?() => void) {
  if (typeof callback === "function") {
    if (!this._socket) {
      this.once("close", function close() {
        callback(new Error("Not running"));
      });
    } else {
      this.once("close", callback);
    }
  }

  if (this._socket) {
    this._socket.end();
  }

  const self = this;
  setImmediate(function () {
    self.emit("close");
  });
};

// unimplemented net.Server apis
TcpServer.prototype.ref = TcpServer.prototype.unref = function () {
  /* nop */
};

module.exports = TcpServer;
