##试试跨域通信 - Websocket
前面讨论了SSE，作为HTML5规范的一部分，这是一个很好的特性，对于要从服务器拉取数据的应用来说，已经能够很好的满足要求了。但是对于需要双工通信的应用就不那么适用了，在Websocket之前开发人员不得不使用一些折衷方案，例如使用轮询或Comet技术，但是使用这些方案将会给服务器带来很大的压力，会严重增加网络负载。

WebSocket 设计出来的目的就是要取代轮询和 Comet 技术，使客户端浏览器具备像 C/S 架构下桌面系统的实时通讯能力。 浏览器通过 JavaScript 向服务器发出建立 WebSocket 连接的请求，连接建立以后，客户端和服务器端就可以通过 TCP 连接直接交换数据。

因为 WebSocket 连接本质上就是一个 TCP 连接，所以在数据传输的稳定性和数据传输量的大小方面，和轮询以及 Comet 技术比较，具有很大的性能优势。Websocket.org 网站对传统的轮询方式和 WebSocket 调用方式作了一个详细的测试和比较，将一个简单的 Web 应用分别用轮询方式和 WebSocket 方式来实现，在这里引用一下他们的测试结果图：

![polling compare with websockets](http://liuwanlin.info/content/images/2015/04/image002.jpg)

通过这张图可以清楚的看出，在流量和负载增大的情况下，`WebSocket` 方案相比传统的 `Ajax` 轮询方案有极大的性能优势。下面我们就一起来看一看 `Websocket` 吧。

###Websocket规范
`WebSocket` 协议本质上是一个基于 `TCP` 的协议。为了建立一个 `WebSocket` 连接，客户端浏览器首先要向服务器发起一个 `HTTP` 请求，这个请求和通常的 `HTTP` 请求不同，包含了一些附加头信息，其中附加头信息 `Upgrade: WebSocket` 表明这是一个申请协议升级的 `HTTP` 请求，服务器端解析这些附加的头信息然后产生应答信息返回给客户端，客户端和服务器端的 `WebSocket` 连接就建立起来了，双方就可以通过这个连接通道自由的传递信息，并且这个连接会持续存在直到客户端或者服务器端的某一方主动的关闭连接。首先我们来看一看 `Websocket` 的握手过程：

![websocket handshake](http://liuwanlin.info/content/images/2015/04/Websocket-handshake.png)

`Websocket` 请求和通常的 `HTTP` 请求很相似，但是其中有些内容是和 `WebSocket` 协议密切相关的，相比于普通的 `HTTP` 请求多了一些字段:
* `Upgrade`：告诉服务器这个HTTP连接是升级的Websocket连接。
* `Connection`：告知服务器当前请求连接是升级的。
* `Sec-WebSocket-Key`：为了表示服务器同意和客户端进行Socket连接，服务器端需要使用客户端发送的这个Key进行校验，然后返回一个校验过的字符串给客户端，客户端验证通过后才能正式建立Socket连接。

服务器接收请求后，会对请求进行处理，返回的响应头包含了是否同意握手的依据:
* `Status Code`: 101 Switching Protocols，表示变换协议
* `Upgrade` 和 `Connection`：这两个字段是服务器返回的告知客户端同意使用升级并使用Websocket协议，用来完善HTTP升级响应
* `Sec-WebSocket-Accept`：服务器端将加密处理后的握手Key通过这个字段返回给客户端表示服务器同意握手建立连接

上述响应头字段被客户端浏览器解析，如果验证到`Sec-WebSocket-Accept`字段的信息符合要求就会建立连接，同时就可以发送`WebSocket`的数据帧了。如果该字段不符合要求或者为空或者HTTP状态码不为101，就不会建立连接。

###Websocket数据帧
Websocket传输数据和HTTP协议有所不同，它是以数据帧的形式来传输数据的，这点和TCP协议是很相似的。

这里直接给出官方文档（[RFC-6455](http://www.rfc-base.org/txt/rfc-6455.txt)）提供的一个结构图：
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
 ```
对于这样一张图，相信学习过计算机网络课程的对此并不陌生，作为一种数据传输协议我们来看看相关字段的长度和含义（更多内容请看[这里](http://jinnianshilongnian.iteye.com/blog/1899876)）：
```
FIN      1bit 表示信息的最后一帧，flag，也就是标记符  
RSV 1-3  1bit each 以后备用的 默认都为 0  
Opcode   4bit 帧类型  
Mask     1bit 掩码，是否加密数据，默认必须置为1 （这里很蛋疼）  
Payload  7bit 数据的长度  
Masking-key      1 or 4 bit 掩码  
Payload data     (x + y) bytes 数据  
Extension data   x bytes  扩展数据  
Application data y bytes  程序数据  
```
这里需要说明一下`Opcode`字段的具体含义：
```
0×0：附加数据帧  
0×1：文本数据帧  
0×2：二进制数据帧  
0×3-7暂时无定义，为以后的非控制帧保留  
0×8：连接关闭  
0×9：ping  
0xA：pong  
0xB-F暂时无定义，为以后的控制帧保留 
```
###客户端API
`Websocket`协议的接口定义请看[官方文档](http://www.w3.org/TR/2011/WD-websockets-20110419/#websocket)，这里不给出具体格式，但是我们来看一看`Websocket`协议接口有哪些内容：

**连接状态**：
* `CONNECTING`：0，连接中
* `OPEN`：1，已连接
* `CLOSING`：2，关闭中
* `CLOSED`：3，已关闭

**事件**：
* `onopen`：连接建立
* `onmessage`：接收到服务器数据
* `onerror`：发生错误
* `onclose`：连接关闭

**方法**：
* `send`：连接过程中，可以使用此方法向服务器发送消息
* `close`：关闭与服务器的链接
下面就简单的试一试吧：

```javascript
var ws = new WebSocket("ws://localhost:3000/socket");  
ws.onopen = function() {  
     ws.send("我要发个消息到服务器");
};
ws.onmessage = function(evt) {  
    var received_msg = evt.data;
    //处理你的数据
};
ws.onclose = function() {  
    alert("连接已关闭..."); 
};
ws.onerror = function() {  
    alert("好像发生错误了..."); 
};
```
上面就是一段典型的使用`Websocket`的客户端代码，只需要拓展各个方法中的逻辑，就可以实现你想要的结果。服务器端对于`Websocket`协议的支持也是不错的，可以选择的库是很丰富的，你可以根据服务器端的语言来选择不同的版本（详情看[这里](http://www.html5rocks.com/zh/tutorials/websockets/basics/#toc-serverside)），当然你也可以基于`Websocket`规范去实现。

###实现
下面我们就用Websocket协议来实现一个聊天室吧，由于代码较多，这里就不贴出来了，详情看源码。

效果如下：

![websocket chat](http://liuwanlin.info/content/images/2015/04/websocket-chat.gif)

###参考
* [WebSockets 简介](http://www.html5rocks.com/zh/tutorials/websockets/basics/)
* [websocket规范 RFC6455 中文版](http://blog.csdn.net/stoneson/article/details/8063802)
