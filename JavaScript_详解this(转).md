#### 全局this

浏览器宿主的全局环境中，this指的是window对象。

```js
    console.log(this === window); //true
```

浏览器中在全局环境下，使用var声明变量其实就是赋值给this或window。

```js
    var foo = "bar";
    console.log(this.foo); //logs "bar"
    console.log(window.foo); //logs "bar"
```
示例

任何情况下，创建变量时没有使用var或者let(ECMAScript 6)，也是在操作全局this。

```js
    foo = "bar";

    function testThis() {
      foo = "foo";
    }

    console.log(this.foo); //logs "bar"
    testThis();
    console.log(this.foo); //logs "foo"
```


#### 函数或方法里的this

除了DOM的事件回调或者提供了执行上下文（后面会提到）的情况，函数正常被调用（不带new）时，里面的this指向的是全局作用域。

```js
    foo = "bar";

    function testThis() {
      this.foo = "foo";
    }

    console.log(this.foo); //logs "bar"
    testThis();
    console.log(this.foo); //logs "foo"
```



还有个例外，就是使用了"use strict";。此时this是undefined。

```js
    foo = "bar";

    function testThis() {
      "use strict";
      this.foo = "foo";
    }

    console.log(this.foo); //logs "bar"
    testThis();  //Uncaught TypeError: Cannot set property 'foo' of undefined 
```
示例

当用调用函数时使用了new关键字，此刻this指代一个新的上下文，不再指向全局this。

```js
    foo = "bar";

    function testThis() {
      this.foo = "foo";
    }

    console.log(this.foo); //logs "bar"
    new testThis();
    console.log(this.foo); //logs "bar"

    console.log(new testThis().foo); //logs "foo"
```

通常我将这个新的上下文称作实例。

#### 原型中的this

函数创建后其实以一个函数对象的形式存在着。既然是对象，则自动获得了一个叫做prototype的属性，可以自由地对这个属性进行赋值。当配合new关键字来调用一个函数创建实例后，此刻便能直接访问到原型身上的值。

```js
function Thing() {
    console.log(this.foo);
}

Thing.prototype.foo = "bar";

var thing = new Thing(); //logs "bar"
console.log(thing.foo);  //logs "bar"
```


当通过new的方式创建了多个实例后，他们会共用一个原型。比如，每个实例的this.foo都返回相同的值，直到this.foo被重写。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {
    console.log(this.foo);
}
Thing.prototype.setFoo = function (newFoo) {
    this.foo = newFoo;
}

var thing1 = new Thing();
var thing2 = new Thing();

thing1.logFoo(); //logs "bar"
thing2.logFoo(); //logs "bar"

thing1.setFoo("foo");
thing1.logFoo(); //logs "foo";
thing2.logFoo(); //logs "bar";

thing2.foo = "foobar";
thing1.logFoo(); //logs "foo";
thing2.logFoo(); //logs "foobar";
```


在实例中，this是个特殊的对象，而this自身其实只是个关键字。你可以把this想象成在实例中获取原型值的一种途径，同时对this赋值又会覆盖原型上的值。完全可以将新增的值从原型中删除从而将原型还原为初始状态。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {
    console.log(this.foo);
}
Thing.prototype.setFoo = function (newFoo) {
    this.foo = newFoo;
}
Thing.prototype.deleteFoo = function () {
    delete this.foo;
}

var thing = new Thing();
thing.setFoo("foo");
thing.logFoo(); //logs "foo";
thing.deleteFoo();
thing.logFoo(); //logs "bar";
thing.foo = "foobar";
thing.logFoo(); //logs "foobar";
delete thing.foo;
thing.logFoo(); //logs "bar";
```

...或者不通过实例，直接操作函数的原型。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {
    console.log(this.foo, Thing.prototype.foo);
}

var thing = new Thing();
thing.foo = "foo";
thing.logFoo(); //logs "foo bar";
```


同一函数创建的所有实例均共享一个原型。如果你给原型赋值了一个数组，那么所有实例都能获取到这个数组。除非你在某个实例中对其进行了重写，实事上是进行了覆盖。
```js
function Thing() {
}
Thing.prototype.things = [];


var thing1 = new Thing();
var thing2 = new Thing();
thing1.things.push("foo");
console.log(thing2.things); //logs ["foo"]
```


通常上面的做法是不正确的（译注：改变thing1的同时也影响了thing2）。如果你想每个实例互不影响，那么请在函数里创建这些值，而不是在原型上。
```js
function Thing() {
    this.things = [];
}

var thing1 = new Thing();
var thing2 = new Thing();
thing1.things.push("foo");
console.log(thing1.things); //logs ["foo"]
console.log(thing2.things); //logs []
```

多个函数可以形成原型链，这样this便会在原型链上逐步往上找直到找到你想引用的值。

```js
function Thing1() {
}
Thing1.prototype.foo = "bar";

function Thing2() {
}
Thing2.prototype = new Thing1();
var thing = new Thing2();
console.log(thing.foo); //logs "bar"
```

很多人便是利用这个特性在JS中模拟经典的对象继承。

注意原型链底层函数中对this的操作会覆盖上层的值。
```js
function Thing1() {
}
Thing1.prototype.foo = "bar";

function Thing2() {
    this.foo = "foo";
}
Thing2.prototype = new Thing1();

function Thing3() {
}
Thing3.prototype = new Thing2();


var thing = new Thing3();
console.log(thing.foo); //logs "foo"
```

我习惯将赋值到原型上的函数称作方法。上面某些地方便使用了方法这样的字眼，比如logFoo方法。这些方法中的this同样具有在原型链上查找引用的魔力。通常将最初用来创建实例的函数称作构造函数。

原型链方法中的this是从实例中的this开始住上查找整个原型链的。也就是说，如果原型链中某个地方直接对this进行赋值覆盖了某个变量，那么我们拿到 的是覆盖后的值。

```js
function Thing1() {
}
Thing1.prototype.foo = "bar";
Thing1.prototype.logFoo = function () {
    console.log(this.foo);
}

function Thing2() {
    this.foo = "foo";
}
Thing2.prototype = new Thing1();


var thing = new Thing2();
thing.logFoo(); //logs "foo";
```

在JavaScript中，函数可以嵌套函数，也就是你可以在函数里面继续定义函数。但内层函数是通过闭包获取外层函数里定义的变量值的，而不是直接继承this。

```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {
    var info = "attempting to log this.foo:";
    function doIt() {
        console.log(info, this.foo);
    }
    doIt();
}
var thing = new Thing();
thing.logFoo();  //logs "attempting to log this.foo: undefined"
```

上面示例中，doIt 函数中的this指代是全局作用域或者是undefined如果使用了"use strict";声明的话。对于很多新手来说，理解这点是非常头疼的。

还有更奇葩的。把实例的方法作为参数传递时，实例是不会跟着过去的。也就是说，此时方法中的this在调用时指向的是全局this或者是undefined在声明了"use strict";时。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {  
    console.log(this.foo);   
}

function doIt(method) {
    method();
}


var thing = new Thing();
thing.logFoo(); //logs "bar"
doIt(thing.logFoo); //logs undefined
```

所以很多人习惯将this缓存起来，用个叫self或者其他什么的变量来保存，以将外层与内层的this区分开来。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () {
    var self = this;
    var info = "attempting to log this.foo:";
    function doIt() {
        console.log(info, self.foo);
    }
    doIt();
}


var thing = new Thing();
thing.logFoo();  //logs "attempting to log this.foo: bar"
```

...但上面的方式不是万能的，在将方法做为参数传递时，就不起作用了。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () { 
    var self = this;
    function doIt() {
        console.log(self.foo);
    }
    doIt();
}

function doItIndirectly(method) {
    method();
}


var thing = new Thing();
thing.logFoo(); //logs "bar"
doItIndirectly(thing.logFoo); //logs undefined
```

解决方法就是传递的时候使用bind方法显示指明上下文，bind方法是所有函数或方法都具有的。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () { 
    console.log(this.foo);
}

function doIt(method) {
    method();
}


var thing = new Thing();
doIt(thing.logFoo.bind(thing)); //logs bar
```

同时也可以使用apply或call 来调用该方法或函数，让它在一个新的上下文中执行。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
Thing.prototype.logFoo = function () { 
    function doIt() {
        console.log(this.foo);
    }
    doIt.apply(this);
}

function doItIndirectly(method) {
    method();
}


var thing = new Thing();
doItIndirectly(thing.logFoo.bind(thing)); //logs bar
```

使用bind可以任意改变函数或方法的执行上下文，即使它没有被绑定到一个实例的原型上。
```js
function Thing() {
}
Thing.prototype.foo = "bar";
function logFoo(aStr) {
    console.log(aStr, this.foo);
}
var thing = new Thing();
logFoo.bind(thing)("using bind"); //logs "using bind bar"
logFoo.apply(thing, ["using apply"]); //logs "using apply bar"
logFoo.call(thing, "using call"); //logs "using call bar"
logFoo("using nothing"); //logs "using nothing undefined"
```

避免在构造函数中返回作何东西，因为返回的东西可能覆盖本来该返回的实例。

```js
function Thing() {
    return {};
}
Thing.prototype.foo = "bar";


Thing.prototype.logFoo = function () {
    console.log(this.foo);
}


var thing = new Thing();
thing.logFoo(); //Uncaught TypeError: undefined is not a function
```


#### 对象中的this

可以在对象的任何方法中使用this来访问该对象的属性。这与用new得到的实例是不一样的。
```
var obj = {
    foo: "bar",
    logFoo: function () {
        console.log(this.foo);
    }
};

obj.logFoo(); //logs "bar"
```

注意这里并没有使用new，更没有函数的调用来创建对象。也可以将函数绑定到对象，就好像这个对象是一个实例一样。

```js
var obj = {
    foo: "bar"
};

function logFoo() {
    console.log(this.foo);
}
//在obj的作用域执行函数
logFoo.apply(obj); //logs "bar"
```

此时使用this没有向上查找原型链的复杂工序。通过this所拿到的只是该对象身上的属性而以。

```js
var obj = {
    foo: "bar",
    deeper: {
        logFoo: function () {
            console.log(this.foo);
        }
    }
};

obj.deeper.logFoo(); //logs undefined
```


也可以不通过this，直接访问对象的属性。
```js
var obj = {
    foo: "bar",
    deeper: {
        logFoo: function () {
            console.log(obj.foo);
        }
    }
};

obj.deeper.logFoo(); //logs "bar"
```

#### DOM 事件回调中的this

在DOM事件的处理函数中，this指代的是被绑定该事件的DOM元素。

```js
function Listener() {
    document.getElementById("foo").addEventListener("click",
       this.handleClick);
}
Listener.prototype.handleClick = function (event) {
    console.log(this); //logs "<div id="foo"></div>"
}

var listener = new Listener();
document.getElementById("foo").click();
```

...除非你通过bind人为改变了事件处理器的执行上下文。

```js
function Listener() {
    document.getElementById("foo").addEventListener("click", 
        this.handleClick.bind(this));
}
Listener.prototype.handleClick = function (event) {
    console.log(this); //logs Listener {handleClick: function}
}

var listener = new Listener();
document.getElementById("foo").click();
```

HTML中的this

HTML标签的属性中是可能写JS的，这种情况下this指代该HTML元素。
```html
<div id="foo" onclick="console.log(this);"></div>
```
```js
document.getElementById("foo").click(); //logs <div id="foo"...
```


#### jQuery中的this

一如HTML DOM元素的事件回调，jQuery库中大多地方的this也是指代的DOM元素。页面上的事件回调和一些便利的静态方法比如$.each 都是这样的。

<div class="foo bar1"></div>
<div class="foo bar2"></div>
```js
$(".foo").each(function () {
    console.log(this); //logs <div class="foo...
});
$(".foo").on("click", function () {
    console.log(this); //logs <div class="foo...
});
$(".foo").each(function () {
    this.click();
});
```
示例

#### 传递 this

如果你用过underscore.js或者lo-dash你便知道，这两个库中很多方法你可以传递一个参数来显示指定执行的上下文。比如_.each。自ECMAScript 5 标准后，一些原生的JS方法也允许传递上下文，比如forEach。事实上，上文提到的bind，apply还有call 已经给我们手动指定函数执行上下文的能力了。
```js
function Thing(type) {
    this.type = type;
}
Thing.prototype.log = function (thing) {
    console.log(this.type, thing);
}
Thing.prototype.logThings = function (arr) {
   arr.forEach(this.log, this); // logs "fruit apples..."
   _.each(arr, this.log, this); //logs "fruit apples..."
}

var thing = new Thing("fruit");
thing.logThings(["apples", "oranges", "strawberries", "bananas"]);
````



转载，较原文有修改[原文链接](http://www.cnblogs.com/Wayou/p/all-this.html#home)。
