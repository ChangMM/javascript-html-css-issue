##图像Ping和JSONP
之前关于[CORS](http://liuwanlin.info/corsxiang-jie/)（Cross-Origin Resource Sharing）我已经翻译了一篇很详细的文章，如果对于CORS感兴趣的赶快去看看吧。今天就来试试到底怎么跨域吧。
在CORS出现之前，要实现Ajax跨域通信是比较困难的。开发人员们想出了一些方法，利用DOM中能够执行跨域请求的功能，在不依赖XHR对象的情况下也能发送某种请求。例如图像ping和JSONP，这些技术今天仍然被广泛使用，那么我们就来看看吧。

###图像ping
我们每天浏览很多的网页，有时候可能会发现某些图片（`<img>`）是来自其他网站的，其实你看到的就是一种跨域，由于图片不受“同源策略”限制，我们就可以利用图片进行跨域了。我们将图片的src属性指向请求的地址，通过监听load和error事件，就能知道响应什么时候接受了,响应的数据可以是任意内容，但通常是像素图或204响应。图像ping的例子如下：
```javascript
var btn = document.querySelector("#start-ping");  
btn.onclick = function(){  
    var img = new Image();
    img.onload = img.onerror = function(obj){
        document.querySelector("#result").innerHTML = "finished";
    };
    img.src = "http://localhost:3000/img?r="+Math.random();
};
```

服务器端我们使用express，简单的代码如下：
```javascript
router.get('/img', function(req, res, next) {  
  res.send('我是一张图片，我说这句话好像没什么用');
});
```
效果如下：
![image ping](http://liuwanlin.info/content/images/2015/04/image-ping-1.gif)

这种方式优点是很明显的：**兼容性非常好**，缺点就是：**只能发生GET请求，而且无法获取响应文本**。

###JSONP
JSONP是JSON with padding（填充式JSON）的简写，是应用JSON的一种方法，看起来和JSON差不多，只不过是被包含在函数调用中的JSON，就像下面这样：
```javascript
callback({name: 'lwl'});  
```
JSONP由两部分组成：回调函数和数据，回调函数是响应到来时应该在页面中调用的函数，而数据是传入回调函数中的JSON数据（服务器填充的）。下面就是一个典型的JSONP请求：
```javascript
http://example.com/jsonp?callback=handleResponse 
```
JSONP也是不受“同源策略”限制的，原因和图片ping是一样的，`<script>`标签也可以跨越，因此我们可以通过利用JONP来动态创建`<script>`，并将其src指向一个跨域的URL，就可以完成和跨域得服务器之间的通信了。下面就来看一个例子：

```javascript
var btn2 = document.querySelector("#start-jsonp");  
btn2.onclick = function(){  
    var script = document.createElement("script");
    script.src = "http://localhost:3000/jsonp";
    document.body.insertBefore(script, document.body.firstChild);
};
function pagefunc(num){  
    document.querySelector("#result2").innerHTML = "我从服务器获得了一个随机数："+num;
}
```

服务器代码：
```javascript
router.get('/jsonp', function(req, res, next) {  
  res.send('pagefunc(' + Math.random() + ')');
});
```
效果如下：
![jsonp](http://liuwanlin.info/content/images/2015/04/jsonp-1.gif)

JSONP是非常简单易用的，与图像ping相比，优点就是能直接访问响应文本，能够在服务器与客户端建立双向通信。但是JSONP也是有缺点的：JSONP直接从其他域加载代码执行，如果其他域不安全，可能会在响应中夹带一些恶意代码。其次，要确定JSONP请求是否失败并不容易，HTML5为`<script>`增加了onerror方法，但是目前支持度还不是很好。

> [完整代码](https://github.com/superlin/cross-demos)
