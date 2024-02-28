/**
 * Copyright (c) 2015-present, Peel Technologies, Inc.
 * All rights reserved.
 */

#import "TcpModuleClient.h"

#import <React/RCTEventEmitter.h>
#import "CocoaAsyncSocket/GCDAsyncSocket.h"

@interface TcpSocketsClass : RCTEventEmitter<SocketClientDelegate>

@end
