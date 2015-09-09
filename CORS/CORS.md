##使用CORS(Cross Origin Resource Sharing)
###介绍
API给了你缝合丰富的Web体验的思路。但是，这方面的经验也很难转换到浏览器上，浏览器端的跨域请求只能使用像JSONP这样的技术（由于安全问题被限制使用），或者建立一个代理（但是代理的建立和维护是一件痛苦的事）。

跨域资源共享（CORS）是一个W3C规范，它允许在浏览器端发起跨域通信。通过使用XMLHttpRequest对象，CORS允许开发者发送跨域请求，就像发起相同域的请求一样。

CORS的使用场景十分简单。例如alice.com网站有一些bob.com网站想要访问的数据。这种请求通常会因为浏览器的同源策略而被禁止的。然而，通过支持CORS请求，alice.com可以添加一些特殊的响应头，让bob.com访问数据。

正如你从上面的例子看到的，对于CORS的支持需要服务器和客户端之间的协调。幸运的是，如果你是一个客户端开发人员，具体的细节对你来说是屏蔽的。本文的其余部分讲述客户端如何发起跨域请求，以及如何让服务器支持CORS。

###发起CORS请求
> 本节将展示如何用JavaScript发起跨域请求。

####创建XMLRequest对象
CORS在以下浏览器中被支持：
```
Chrome 3+
Firefox 3.5+
Opera 12+
Safari 4+
Internet Explorer 8+
```
> Chrome，Firefox，Opera和Safari都使用XMLHttpRequest2对象。 
> Internet Explorer使用了类似的XDomainRequest对象，其工作原理和XMLHttpRequest大致相同，但增加了额外的安全预防措施。

首先，你需要创建相应的请求对象。Nicholas Zakas写了一个简单的辅助方法来理清浏览器的差异：

```javascript
function createCORSRequest(method, url) {  
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // 检查XMLHttpRequest对象是否有 "withCredentials" 属性
    // 只有XMLHTTPRequest2对象有"withCredentials"属性
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // 否则, 检查是否为XDomainRequest.
    // XDomainRequest只在IE中被支持
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // 否则, 浏览器不支持CORS
    xhr = null;

  }
  return xhr;
}

var xhr = createCORSRequest('GET', url);  
if (!xhr) {  
  throw new Error('CORS not supported');
}
```
####事件处理
最原始的XMLHttpRequest对象只有一个用来处理所有响应的事件处理程序onreadystatechange。虽然onreadystatechange依然可用，但是XMLHttpRequest2引入了很多新的事件处理程序。下面就是完整的清单：

* `onloadstart*`：请求开始
* `onprogress`：加载和发送数据中
* `onabort*`：请求中断，例如调用abort()方法
* `onerror`：请求失败
* `onload`：请求成功
* `ontimeout`：请求超过了用户设定的超时时间
* `onloadend*`：请求结束（无论失败还是成功）
（加*的不被IE的XDomainRequest支持）

在大多数情况下，你至少要处理的onload和onerror的事件：
```javascript
xhr.onload = function() {  
 var responseText = xhr.responseText;
 console.log(responseText);
 // 处理响应
};

xhr.onerror = function() {  
  console.log('There was an error!');
};
```
当发生错误时，浏览器在报告哪里出了问题上做的并不好。例如，Firefox对于所有的错误报告0状态和空状态文本。浏览器也会报告错误信息到控制台日志，但此消息无法通过JavaScript访问。当处理onerror时，你就会知道发生了错误。

####withCredentials
标准的CORS请求默认不发送或设置任何cookie。为了在请求中附带cookie，你需要设置XMLHttpRequest的withCredentials属性为true：
```javascript
xhr.withCredentials = true;  
```
为了使CORS起作用，服务器还必须通过设置Access-Control-Allow-Credentials响应头为true来启用凭据。详情参见服务器部分。
```javascript
Access-Control-Allow-Credentials: true;
```
设置withCredentials属性后，远程域的请求中将带上所有cookie，而且它也将设置远程域的所有cookie。请注意，这些cookie仍然遵守同源策略，因此你的JavaScript代码无法从document.cookie中或响应头访问cookie。它们仅由远程域进行控制。

####发送请求
现在你的CORS请求已经设置好了，你可以发送请求了。这项工作可以通过调用send()方法来完成：
```javascript
xhr.send();  
```
如果请求包含请求体，那么请求体可以作为参数传入send()。
这就是CORS！假设服务器配置正确，可以为CORS请求作出回应，onload事件处理程序就会处理响应，就像你熟悉的标准的同源XHR一样。

####端到端的例子
下面是一个完整的可运行的CORS请求示例。运行示例并查看在浏览器的调试器工具中实际发送的请求。
```javascript
// 创建XHR 对象.
function createCORSRequest(method, url) {  
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // 不支持CORS.
    xhr = null;
  }
  return xhr;
}

// 辅助函数：解析响应内容中的title标签
function getTitle(text) {  
  return text.match('<title>(.*)?</title>')[1];
}

// 发起CORS请求.
function makeCorsRequest() {  
  // HTML5 Rocks支持 CORS.
  var url = 'http://updates.html5rocks.com';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // 响应处理.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}
```
####服务端添加CORS支持
CORS最繁重的部分是浏览器和服务器之间的处理。浏览器增加了一些额外的头，有时客户端发送CORS请求时会发送额外的请求。这些细节对于客户端是透明的（但可以使用一个包分析器诸如Wireshark去发现）。
![服务器端对CORS的支持](http://liuwanlin.info/content/images/2015/Mar/cors_flow.png)
浏览器制造商负责浏览器端的实现。本节将介绍如何在服务器端配置它的头，以支持CORS。

####CORS请求的类型
**跨域请求有两种形式：**

1. 简单请求
2. “不是那么简单的请求”（我自己创造的一个术语）

**简单请求满足以下条件：**
* 以下的HTTP请求方法之一（大小写敏感）：
  1. HEAD
  2. GET
  3. POST
* 拥有以下的HTTP头部（大小写不敏感）：
  1. Accept
  2. Accept-Language
  3. Content-Language
  4. Last-Event-ID
  5. Content-Type，但是只能是以下的值之一：application/x-www-form-urlencoded、multipart/form-data、text/plain
  
简单请求的特征如上面所描述的，因为它们不用使用CORS就可以发送跨域请求了。例如，一个JSONP请求可以发出跨域GET请求。或HTML可以用POST来提交表单。

####处理简单的请求
我们从一个客户端的简单请求开始检查吧。下面的代码首先显示了如何使用JavaScript代码来发送一个简单的GET请求，接着是浏览器发出实际的HTTP请求。

Javascript：
```javascript
var url = 'http://api.alice.com/cors';  
var xhr = createCORSRequest('GET', url);  
xhr.send();  
```
HTTP请求:
```javascript
GET /cors HTTP/1.1  
Origin: http://api.bob.com  
Host: api.alice.com  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0... 
```
首先要注意的事情是，一个有效的CORS请求，总是包含源头部。此源头部是由浏览器中加入，并且不能由用户控制。源头部的值是协议（如http），域名（如bob.com）和端口（只有不是默认端口时才包含，如81）的组合，例如：`http:// api.alice.com`

源请求头的存在并不一定意味着该请求是一个跨域请求。虽然所有的跨域请求将包含一个源头部，一些同源请求可能也有一个。例如，Firefox在同源请求时不包括源头部。但是，Chrome和Safari在发送`POST/ PUT/` DELETE请求会包含源头部（同源GET请求不会有源头部）。下面是一个包含源头部的同源请求的例子：

HTTP请求：
```javascript
POST /cors HTTP/1.1  
Origin: http://api.bob.com  
Host: api.bob.com  
```
好消息是，对于同源请求浏览器并不需要CORS响应头。因此不管是否有CORS标头，同源请求的响应都是直接发送给用户。但是，如果你的服务器的代码返回一个错误，例如请求源不在允许域名列表中，所以一定要在头部中包括请求的源。

下面是一个合法的服务器响应；

HTTP响应：
```javascript
Access-Control-Allow-Origin: http://api.bob.com  
Access-Control-Allow-Credentials: true  
Access-Control-Expose-Headers: FooBar  
Content-Type: text/html; charset=utf-8
```
所有和CORS相关的头部都是以"Access-Control-"开头。下面是下面一些头部的详细介绍：

`Access-Control-Allow-Origin`（必须）：这个头部必须包含在所有有效的CORS响应中；省略头部将导致CORS请求失败。该头部的值可以呼应源请求头（如上面的例子），或者是一个“`*`”，以允许从任何来源的请求。如果您想任何网站能够访问你的数据，用“`*`”是好的。但是，如果你想更好地控制谁可以访问您的数据，就应该使用实际的值。

`Access-Control-Allow-Credentials`（可选）：默认情况下，CORS请求中不会包含cookie。用这个头部来表示cookie应包括在CORS请求中。这个头部的唯一有效值为true（全部小写）。如果你不需要cookie，不包括此头部（而不是它的值设置为false）。

`Access-Control-Allow-Credentials`头应该和的XMLHttpRequest对象的withCredentials属性相结合。这两个属性必须同时设置为真，CORS请求才能成功。如果withCredentials为真，但没有Access-Control-Allow-Credentials头部，请求将会失败（反之亦然）。

建议你不要设置这个头部，除非你确定想要将cookie加入CORS请求中。

`Access-Control-Expose-Headers`（可选）：所述的XMLHttpRequest2对象的getResponseHeader()方法返回一个特定的响应报头的值。在CORS请求期间，getResponseHeader()方法只能访问简单的响应头。简单的响应头定义如下：

* Cache-Control
* Conten-Language
* Content-Type
* Expires
* Last-Modified
* Pragma

如果你希望客户端能够访问其他头部，您必须使用Access-Control-Expose-Headers头。该头部的值是一个用逗号分隔要暴露给客户端的响应报头的列表。

####处理一个不是那么简单的请求
除了使用简答的GET请求外，如果你想要做更多的事情怎么办？也许你要支持其他的HTTP方法，如PUT和DELETE，或者你想设置Content-Type: application/json来支持JSON。那么你就需要使用我们所说的不那么简单的请求。

Javascript：
```javascript
var url = 'http://api.alice.com/cors';  
var xhr = createCORSRequest('PUT', url);  
xhr.setRequestHeader(  
    'X-Custom-Header', 'value');
xhr.send();  
```
预检请求：
```javascript
OPTIONS /cors HTTP/1.1  
Origin: http://api.bob.com  
Access-Control-Request-Method: PUT  
Access-Control-Request-Headers: X-Custom-Header  
Host: api.alice.com  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0...  
```
就像简单的请求那样，浏览器为每个请求增加了源头部，包括预检。预检请求就是HTTP OPTIONS请求（所以要确保你的服务器能够应对这个方法）。它还包含了一些额外的头：

`Access-Control-Request-Method`：实际的请求的HTTP方法。这个请求报头总是包含，即使HTTP方法是前面定义的简单请求（GET，POST，HEAD）。
`Access-Control-Request-Headers`：逗号分隔的不是那么简单的请求头部的列表。
预检请求是在实际的请求之前发送的，用来检查实际请求的权限。服务器应检查两个头以上，以确认这两个HTTP方法和请求头是有效以及能被接受。

如果HTTP方法和报头是有效的，服务器应该响应内容如下：
```javascript
Access-Control-Allow-Origin: http://api.bob.com  
Access-Control-Allow-Methods: GET, POST, PUT  
Access-Control-Allow-Headers: X-Custom-Header  
Content-Type: text/html; charset=utf-8  
```
`Access-Control-Allow-Origin`（必须）：和简答的响应一样，预检响应应该包含这个头部。

`Access-Control-Allow-Methods`（必须）：逗号分隔的支持的HTTP方法列表。需要注意的是，虽然在预检请求只用于检查单个HTTP方法的权限，这种初探报头可以包括所有受支持的HTTP方法的列表。这是很有用的，因为预检响应可以被缓存，因此单个预检响应可以包含关于多个请求类型的详细信息。

`Access-Control-Allow-Headers`（设置了`Access-Control-Request-Headers`头部则时必须）：逗号分隔的支持的请求头的列表。像前面的`Access-Control-Allow-Methods`头部，可以列出服务器所支持的所有的报头（不只是预检请求所请求的报头）。

`Access-Control-Allow-Credentials`（可选）：和简单请求一样。

`Access-Control-Max-Age`（可选）：每一个请求都要发送预检请求的代价是昂贵的，因为每一个客户端请求浏览器都要发送两个请求。这个头的值允许预检响应能够缓存一定的时间。

一旦预检要求提供了权限，浏览器才发出实际要求。实际的请求看起来像简单的请求，响应应该以同样的方式进行处理：

实际请求：
```javascript
PUT /cors HTTP/1.1  
Origin: http://api.bob.com  
Host: api.alice.com  
X-Custom-Header: value  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0...  
```
实际的响应
```javascript
Access-Control-Allow-Origin: http://api.bob.com  
Content-Type: text/html; charset=utf-8 
```
如果服务器要拒绝CORS请求时，它可以只返回没有任何CORS头的通用响应（如HTTP 200）。如果HTTP方法或头部不适预检请求返回的，服务器就有可能拒绝这次请求。这是因为没有在特定的CORS响应报头，浏览器就会判定该请求是无效的，并且不作实际的请求：

预检请求：
```javascript
OPTIONS /cors HTTP/1.1  
Origin: http://api.bob.com  
Access-Control-Request-Method: PUT  
Access-Control-Request-Headers: X-Custom-Header  
Host: api.alice.com  
Accept-Language: en-US  
Connection: keep-alive  
User-Agent: Mozilla/5.0...  
```
预检响应：
```javascript
// ERROR - No CORS headers, this is an invalid request!
Content-Type: text/html; charset=utf-8  
```
如果在CORS请求错误，浏览器会触发客户端的onerror事件处理程序。它也将打印以下错误控制台日志：
```javascript
XMLHttpRequest cannot load http://api.alice.com. Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.  
```
浏览器并不会告诉你太多详细信息为什么会发生错误，它只会告诉你发生了错误。

####关于安全的题外话
虽然CORS奠定了基础使跨域请求，CORS头并不能代替健全的安全策略。你不应该依靠CORS头来保护你的网站资源。使用CORS头给浏览器的跨域访问提供了方向，但是如果你需要在你的内容的附加安全限制，你就应该使用一些其他的安全机制，如cookie或OAuth2。

###jQuery发起CORS请求
jQuery的$.ajax()方法可以用来发送常规的XHR请求和CORS请求。下面是关于jQuery的实现的一些注意事项：

* jQuery的CORS的实现不支持IE的XDomainRequest 对象。但是可以使用一些jQuery插件来支持。详情请看：http://bugs.jquery.com/ticket/8283
* $.support.cors应该被设置为true如果浏览器支持CORS（IE中返回false）。可以通过这种方式检查是否支持CORS请求
下面是使用jQuery来发送CORS请求。注释部分说明了一些特定属性如何与CORS交互的。

```javascript
$.ajax({

  // The 'type' property sets the HTTP method.
  // A value of 'PUT' or 'DELETE' will trigger a preflight request.
  type: 'GET',

  // The URL to make the request to.
  url: 'http://updates.html5rocks.com',

  // The 'contentType' property sets the 'Content-Type' header.
  // The JQuery default for this property is
  // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
  // a preflight. If you set this value to anything other than
  // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
  // you will trigger a preflight request.
  contentType: 'text/plain',

  xhrFields: {
    // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
    // This can be used to set the 'withCredentials' property.
    // Set the value to 'true' if you'd like to pass cookies to the server.
    // If this is enabled, your server must respond with the header
    // 'Access-Control-Allow-Credentials: true'.
    withCredentials: false
  },

  headers: {
    // Set any custom headers here.
    // If you set any non-simple headers, your server must include these
    // headers in the 'Access-Control-Allow-Headers' response header.
  },

  success: function() {
    // Here's where you handle a successful response.
  },

  error: function() {
    // Here's where you handle an error response.
    // Note that if the error was due to a CORS issue,
    // this function will still fire, but there won't be any additional
    // information about the error.
  }
});
```
####存在的问题
提供给onerror处理没有错误信息 - 当的onerror处理程序被触发时，状态码为0，并且没有状态文本。这可能是设计原因，但试图调试为什么CORS请求失败时，它可能会造成混淆。

####CORS服务器流图
下面的流程图说明了服务器如何决定哪些报头应该添加到一个CORS响应中。
![CORS服务器流图](http://liuwanlin.info/content/images/2015/Mar/cors_server_flowchart.png)

###原文地址
http://www.html5rocks.com/en/tutorials/cors/?redirect_from_locale=zh
