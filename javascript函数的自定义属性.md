> `javascript`中的函数不是原始值，而是一种特殊的对象，也就是说函数可以拥有属性。
下面通过一个例子具体看下：

*计算阶乘的例子*
```javascript
function factorial (n){
  if(isFinite(n) && n>0 && n==Math.round(n)){
    if(!(n in factorial)){
      factorial[n] = n * factorial(n-1);
    }
    return factorial[n];
  }
  else return NaN;
}
factorial[1] = 1;
```
