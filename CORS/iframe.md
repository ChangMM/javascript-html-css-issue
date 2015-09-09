##试试跨域通信 - 利用iframe
之前的几篇文章已经已经讨论了多种关于跨域通信的方式，今天我们来讨论一下最基本也是最复杂的一种方式：使用iframe跨域，对于怎么使用iframe跨域的文章，网上能搜到的太多了。如果你有兴趣可以去看看这篇文章-《[Improve cross-domain communication with client-side solutions](http://www.ibm.com/developerworks/library/wa-crossdomaincomm/)》，里面的配图实在是通俗易懂，本文中也会借用这篇文章中的配图。下面就进入主题吧。

为了方便演示跨域效果，先在 hosts 文件中加上以下内容：
```
127.0.0.1 www.myapp.com  
127.0.0.1 sample.myapp.com  
127.0.0.1 www.otherapp.com 
```
下面我们就开始讨论如何使用`iframe`进行跨域通信，这里主要介绍以下几种方案： `document.domain` 、 `URL.hash` 、 `Cross-fragment` 、 `Window.name` 、 `postMessage` 。

###document.domain
如果 A 源和 B 源具有相同的父域名，通过设置 `document.domain` 属性，就很容易使其相互通信。在 `HTML` 规范中 `document.domain` 是一个只读属性，现代浏览器允许将其设置为父域名（不是顶级域名）。例如，一个是 `www.myapp.com` 的页面，可以设置为 `myapp.com`，而另一个来自 `sample.myapp.com` 的页面也可以设置为 `myapp.com`，下图展示了 `document.domain` 的工作原理：

![子域名跨域](http://liuwanlin.info/content/images/2015/04/subdomain.gif)

通过将不同子域名的 `document.domain` 属性设置为相同的父域名，来实现不同子域名之间的跨域通信，这并不属于同源策略限制的范畴。但是，严格来说，子域名跨域的解决方案最适用于内部应用之间的跨域通信。

这里给出的例子和前文提到的稍有区别，上代码，主页面如下：
```html
<!-- http://www.myapp.com:3000/demo1 -->  
<button>测试</button>  
<div></div>  
<iframe id="ifr" src="http://sample.myapp.com:3000/demo1-iframe"></iframe>  
<script>  
document.domain = 'myapp.com';  
function sayHello(str) {  
    document.querySelector('div').innerHTML = str;
}

document.querySelector('button').onclick = function (){  
    document.querySelector('#ifr').contentWindow.sayHello('Hello son');
}
</script>  
```
iframe页面如下：
```html
<!-- http://sample.myapp.com:3000/demo1-iframe -->  
<div></div>  
<script>  
document.domain = 'myapp.com';  
function sayHello(str) {  
    document.querySelector('div').innerHTML = str;
    parent.sayHello('Hello father');
}
</script>  
```
父页面和iframe中都设置document.domain为myapp.com，父页面中按钮被点击后就去调用iframe中的sayHello方法，子页面同时也会调用父页面的sayHello方法。效果如下：

![demo1](http://liuwanlin.info/content/images/2015/04/demo1.gif)

###URL.hash
一个 URL 由下图所示的几个部分组成：

![url](http://liuwanlin.info/content/images/2015/04/url.gif)

一般来说，URL 的任何改变都重新会加载一个新的网页，除了 hash 的变化，hash 的任何改变都不会导致页面刷新。hash 已经被广泛使用在支持局部刷新的 SPA 应用中，用来记录用户的访问路径。在跨域解决方案中，hash 也非常有用，来自不同源的页面可以相互设置对方的 URL，包括 hash 值，但仍被限制获取对方的 hash 值。文档之间可以通过 hash 来相互通信。如下图所示的例子：

![fragment](http://liuwanlin.info/content/images/2015/04/fragment.gif)

先看主页面代码：
```html
<!-- http://www.myapp.com:3000/demo2 -->  
<button>发送消息</button>  
<iframe id="ifr" src="http://www.otherapp.com:3000/demo2-b"></iframe>  
<script>  
var target = "http://www.otherapp.com:3000/demo2-b";  
function sendMsg(msg){  
    var data = {msg:msg};
    var src = target + "#" + JSON.stringify(data);
    document.getElementById('ifr').src = src;
}

document.querySelector('button').onclick = function (){  
    sendMsg("时间：" + (new Date()));
}
</script>  
```
iframe代码如下：
```html
<!-- http://www.myapp.com:3000/demo2-b -->  
<div></div>  
<script>  
var oldHash = "";  
var target = "http://www.myapp.com:3000/demo2";  
checkMessage = function(){  
    var newHash = window.location.hash;
    if(newHash.length > 1){
        newHash = newHash.substring(1, newHash.length);
        if(newHash != oldHash){
             oldHash = newHash;
             var msgs = JSON.parse(newHash);
             var msg = msgs.msg;
              sendMessage("Hello father");
              document.querySelector('div').innerHTML = msg;
         }
     }
}
window.setInterval(checkMessage, 1000);  
function sendMessage(msg){  
    var hash = "msg="+ msg;
    parent.location.href = target + "#" + hash;
}
</script>
```
主页面向iframe传递参数通过改变iframe的hash值，iframe不断获取自己的hash值，一旦发生变化就立即显示主页面传来的消息，并且通过设置主页面的hash就可以像主页面传递消息了，这样实际就可以完成双向的跨域通行了。效果如下：

![url hash](http://liuwanlin.info/content/images/2015/04/demo2.gif)

###Cross-fragment
由于许多网站的 hash 已经被用于其他用途，对于这样的网站用 hash 跨域将非常复杂（需要从 hash 中合并和分离出消息）。因此我们就有了基于 hash 的一个升级版：cross-fragment，其原理如下图所示：

![cross-fragment](http://liuwanlin.info/content/images/2015/04/crossframe.gif)

这种方案和前一种实质是相同的，都是通过 url 的 hash 来传递参数，但是需要配合一个同域的代理页面来完成跨域。先看主页面代码：
```html
<!-- http://www.myapp.com:3000/demo3 -->  
<button>发送消息</button>  
<div></div>  
<iframe name="otherapp" id="otherapp" src="http://www.otherapp.com:3000/demo3-b"></iframe>  
<script>  
function sendMsg(msg) {  
   var frame = document.createElement("frame");
   var baseProxy = "http://www.otherapp.com:3000/demo3-req-proxy";
   var request = {frameName:"otherapp", data:msg};
   frame.src = baseProxy + "#" + encodeURI(JSON.stringify(request));
   frame.style.display = "none";
   document.body.appendChild(frame);
}
//响应处理函数
function getResponse(data) {  
    document.querySelector('div').innerHTML = "收到计算结果："+data;
}
document.querySelector('button').onclick = function (){  
    sendMsg(Math.random());
    return false;
}
</script>  
```
请求代理页面：
```javascript
// http://www.otherapp.com:3000/demo3-req-proxy
 var hash = window.location.hash;
 if(hash && hash.length>1){
    var request = hash.substring(1, hash.length);
    var obj = JSON.parse(decodeURI(request));
    var data = obj.data;
    // 处理数据
    parent.frames[obj.frameName].getData(data); //目标页面的getData方法
 }
 ```
目标页面：
```html
<!-- http://www.otherapp.com:3000/demo3-b -->  
<div></div>  
<script>  
function getData(data) {  
    document.querySelector('div').innerHTML = "接收到参数："+data;
   var frame = document.createElement("frame");
   var baseProxy = "http://www.myapp.com:3000/demo3-res-proxy";
   //简单的将数据乘以100
   var request = {data : data*100};
   frame.src = baseProxy + "#" + encodeURI(JSON.stringify(request));
   frame.style.display = "none";
   document.body.appendChild(frame);
}
</script> 
```
响应代理页面：
```javascript
// http://www.myapp.com:3000/demo3-res-proxy
 var hash = window.location.hash;
 if(hash && hash.length>1){
    var request = hash.substring(1, hash.length);
    var obj = JSON.parse(decodeURI(request));
    var data = obj.data;
    // 处理数据
    parent.parent.getResponse(data); //主页面的getResponse方法
 }
 ```
这个例子中先在主页面（来自myapp）放置一个otherapp下的iframe（目标页面），点击按钮后就在主页面中构造一个隐藏的iframe（和目标页面同域，来自otherapp，请求代理页面），通过这个请求代理页面调用目标页面的getData方法，这个方法接收传来的数据，处理完成后，构造一个隐藏的iframe（和主页面同域，来自myapp，响应代理页面），通过响应代理页面调用主页面中的getResponse方法。效果如下：

![](http://liuwanlin.info/content/images/2015/04/demo3-1.gif)

这种方法可以用来实现iframe跨域自适应（请看例子）

###window.name
window.name 跨域是一个巧妙的解决方案，一般情况下，我们使用 window.name 的情况如下：
* 使用window.frames[windowName]得到一个子窗口
* 将其设置为链接元素的target属性
加载任何页面 window.name 的值始终保持不变。由于 window.name 这个显著的特点，使其适用于在不同源之间进行跨域通信，但这是个不常用的属性。那么怎么在同源策略下使用呢？下图显示了如何使用 window.name 来跨域通信。

![window.name](http://liuwanlin.info/content/images/2015/04/windowname.gif)

当页面 A 想要从另一个源获取资源或 Web 服务，首先在自己的页面上创建一个隐藏的 iframe B，将 B 指向外部资源或服务，B 加载完成之后，将把响应的数据附加到 window.name 上。由于现在 A 和 B 还不同源，A 依旧不能获取到 B 的 name 属性。当B 获取到数据之后，再将页面导航到任何一个与 A 同源的页面，这时 A 就可以直接获取到 B 的 name 属性值。当 A 获取到数据之后，就可以随时删掉 B。

主页面代码：
```javascript
// http://www.myapp.com:3000/demo4
function sendMsg(msg) {  
  var state = 0, data;
  var frame = document.createElement("frame");
  var baseProxy = "http://www.otherapp.com:3000/demo4-req";
  var request = {data:msg};
  frame.src = baseProxy + "#" + encodeURI(JSON.stringify(request));
  frame.style.display = "none";
  frame.onload  = function(){
      if(state === 1){
       data = frame.contentWindow.name;
       document.querySelector('.res').innerHTML = "获得响应：" + data;
       //删除iframe
       frame.contentWindow.document.write('');
       frame.contentWindow.close();
       document.body.removeChild(frame);
      } else {
          state = 1;
          frame.src = "http://www.myapp.com:3000/demo4-res";
      }
  };
  document.body.appendChild(frame);
}

document.querySelector('button').onclick = function (){  
    var val = Math.random();
    sendMsg(val);
    document.querySelector('.val').innerHTML = "请求数据："+val;
}
```
目标页面代码：
```javascript
// http://www.otherapp.com:3000/demo4-res
var hash = window.location.hash;  
if(hash && hash.length>1){  
   var request = hash.substring(1, hash.length);
   var obj = JSON.parse(decodeURI(request));
   var data = obj.data;
   //数据乘以100
   window.name = data*100;
}
```
这个例子也是将请求的数据放在hash中传入其他域的目标页面，目标页面将数据乘100后设置到window.name中，然后跳转到与主页面同域的页面，这样主页面就可以从window.name中获取结果了。效果如下：

![window.name](http://liuwanlin.info/content/images/2015/04/demo4-1.gif)

###postMessage
HTML5 规范中的新方法 window.postMessage(message, targetOrigin) 可以用于安全跨域通信。当该方法被调用时，将分发一个消息事件，如果窗口监听了相应的消息，窗口就可以获取到消息和消息来源。如下图所示：

![postmessage](http://liuwanlin.info/content/images/2015/04/html5.gif)

如果 iframe 想要通知不同源的父窗口它已经加载完成，可以使用 window.postMessage 来发送消息。同时，它也将监听回馈消息：
```javascript
// http://www.otherapp.com:3000/demo5-b
function postMessage(msg){  
  var targetWindow = parent.window;
  targetWindow.postMessage(msg,"*");
}
function handleReceive(msg){  
 if(msg.data == "ok"){
  //要做的事在这
 }else{
  //重新发送消息
  postMessage(JSON.stringify({color:'red'}));
 }
}
window.addEventListener("message", handleReceive, false);  
window.onload = function(){  
  postMessage(JSON.stringify({color:'red'}));
}
```
父窗口监听了消息事件，当消息到达时，它首先检查消息是否是来 www.otherapp.com，如果是就发送一个反馈消息。
```javascript
// http://www.myapp.com:3000/demo5
function handleReceive(event){  
  if(event.origin != "http://www.otherapp.com:3000") return;
  //处理数据
  var data = JSON.parse(event.data);
  document.querySelector('div').innerHTML = "来自iframe的颜色："+data.color;

  var otherAppFrame = window.frames["otherApp"]
  otherAppFrame.postMessage("ok","http://www.otherapp.com:3000");
}
window.addEventListener("message", handleReceive, false);  
```
至此，所有关于跨域通信的到此结束，如果你还有好的方案请留言哦。

> [完整代码](https://github.com/superlin/cross-demos)。

###参考
* [Improve cross-domain communication with client-side solutions](http://www.ibm.com/developerworks/library/wa-crossdomaincomm/)
