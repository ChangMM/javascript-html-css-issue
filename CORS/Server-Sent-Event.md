##试试跨域通信 - SSE
Comet虽然实现比较简单，但是实际使用过程中并不是那么简单，还需要考虑很多实际的问题，例如连接断开如何重连。而且Comet并不是HTML5规范的一部分，并且在服务器端和浏览器端都需要第三方库的支持。幸运的是HTML5规范中新增了SSE（Server-Sent Event），直接使用SSE API就能实现和Comet一样的功能，下面就一起来看看SSE吧。

###什么是Server-Sent Event
`SSE`主要由两个部分组成：第一个部分是服务器端与浏览器端之间的通讯协议，第二部分则是在浏览器端可供 `JavaScript` 使用的 `EventSource` 对象。 SSE 用于创建到服务器的单向连接，服务器通过这个连接可以发送任意数量的数据。服务器响应的MIME类型必须为`text/event-stream`。SSE支持短轮询、长轮询和HTTP流，而且能在断开连接时自动重新连接。响应文本的内容可以看成是一个事件流，由不同的事件所组成。每个事件由类型和数据两部分组成，同时每个事件可以有一个可选的标识符。不同事件的内容之间通过仅包含回车符和换行符的空行`（“\r\n”`）来分隔。每个事件的数据可能由多行组成。

```javascript
data: first event

data: second event  
id: 100

event: myevent  
data: third event  
id: 101

: this is a comment
data: fourth event  
data: fourth event continue  
```
上面的例子中每个事件用空行分隔，对于每一行，冒号前为该行的类型，冒号后为对应的值。可能的值有：
* 类型为空白，表示该行是注释，会在处理时被忽略。
* 类型为 data，表示该行包含的是数据。以 data 开头的行可以出现多次。所有这些行都是该事件的数据。
* 类型为 event，表示该行用来声明事件的类型。浏览器在收到数据时，会产生对应类型的事件。
* 类型为 id，表示该行用来声明事件的标识符。
* 类型为 retry，表示该行用来声明浏览器在连接断开之后进行再次连接之前的等待时间。

如果服务器端返回的数据中包含了事件的标识符，浏览器会记录最近一次接收到的事件的标识符。如果与服务器端的连接中断，当浏览器端再次进行连接时，会通过 HTTP 头“Last-Event-ID”来声明最后一次接收到的事件的标识符。服务器端可以通过浏览器端发送的事件标识符来确定从哪个事件开始来继续连接。

对于服务器端返回的响应，浏览器端需要在 JavaScript 中使用 EventSource 对象来进行处理。EventSource 使用的是标准的事件监听器方式，只需要在对象上添加相应的事件处理方法即可。EventSource 提供了三个标准事件：

* open：当成功与服务器建立连接时产生
* message：当收到服务器发送的事件时产生
* error：当出现错误时产生
下面就来实现一下吧。

###实现
先来看客户端，首先创建EventSource对象，然后监听标准的open，error，message事件，同时监听了自定义的connecttime事件。当有message到来时，将数据显示到页面的output上。
```javascript
var button  = document.getElementById("connect");  
var status1 = document.getElementById("status");  
var output  = document.getElementById("output");  
var connectTime = document.getElementById("connecttime");  
var source;

function connect() {  
  source = new EventSource("http://localhost:3000/event-stream");
  source.addEventListener("message", function(event) {
    output.textContent = event.data;
  }, false);

  source.addEventListener("connecttime", function(event) {
    connectTime.textContent = "连接创建时间: " + event.data;
  }, false);

  source.addEventListener("open", function(event) {
    button.value = "断开连接";
    status1.textContent = "连接已开启!";
    button.onclick = function(event) {
      source.close();
      button.value = "连接";
      button.onclick = connect;
      status1.textContent = "连接已关闭!";
    };
  }, false);

  source.addEventListener("error", function(event) {
    if (event.target.readyState === EventSource.CLOSED) {
      source.close();
      status1.textContent = "连接已关闭!";
    } else if (event.target.readyState === EventSource.CONNECTING) {
      status1.textContent = "连接已关闭. 正在尝试重连!";
    } else {
      status1.textContent = "连接已关闭. 位置错误!";
    }
  }, false);
}

if (!!window.EventSource) {  
  button.onclick = connect;
} else {
  button.style.display = "none";
  status1.textContent = "你的浏览器不支持server-sent events";
}
```
再来看服务端的实现，首先我们向客户端发送一个connecttime事件的数据-连接时间，然后每隔1s返回一条系统时间的数据，同时监听连接的close事件。这里注意头部Content-Type为text/event-stream，并且由于是跨域的，还要加上Access-Control-Allow-Origin头部。
```javascript
router.get('/event-stream', function(req, res, next) {  
  res.writeHead(200, {
    "Content-Type":"text/event-stream",
    "Cache-Control":"no-cache",
    "Connection":"keep-alive",
    "Access-Control-Allow-Origin" : "*"
  });
  res.write("retry: 10000\n");
  res.write("event: connecttime\n");
  res.write("data: " + (new Date()) + "\n\n");
  res.write("data: " + (new Date()) + "\n\n");

  var interval = setInterval(function() {
    res.write("data: " + (new Date()) + "\n\n");
  }, 1000);
  req.connection.addListener("close", function () {
    clearInterval(interval);
  }, false);
});
```
效果
下面来看看效果吧：
![server-sent events](http://liuwanlin.info/content/images/2015/04/sse.gif)

可以看到`SSE`只建立了一个连接，然后就可以从服务器获取数据了。但是这种方式只能从服务器拉取数据，也就是从建立服务器到客户端的单工通信，如果要实现双工通信可以考虑使用`Websocket`。

SSE目前已经被主流的浏览器支持（**IE不支持**），包括：Firefox 6.0+、Chrome 6.0+、Safari 5.0+、Opera 11.0+、iOS Safari 4.0+、Opera Mobile 11.1+、Chrome for Android 25.0+、Firefox for Android 19.0+ 以及 Blackberry Browser 7.0+ 等。

对于IE的支持，一般用两种方法：第一种办法是在其他浏览器上使用原生 EventSource 对象，而在 IE 上则使用轮询或 Comet 技术来实现；另外一种做法是使用 polyfill 技术，即使用第三方提供的 JavaScript 库来屏蔽浏览器的不同。一般推荐使用第二种方法。

> [完整代码](https://github.com/superlin/cross-demos)

###参考
* [Server-sent Events实战](http://www.ibm.com/developerworks/cn/web/1307_chengfu_serversentevent/)
* [Server-Sent Events in Node.js](http://cjihrig.com/blog/server-sent-events-in-node-js/)
* [Server-Sent Events](http://chimera.labs.oreilly.com/books/1230000000545/ch16.html)
