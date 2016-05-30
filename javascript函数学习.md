###`javascript`中的函数不是原始值，而是一种特殊的对象，也就是说函数可以拥有自定义的属性。
下面通过一个例子具体看下：

** 计算阶乘的例子 **
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
###函数式编程
> 自己实现`map`和`reduce`方法
**map方法**

```javascript
var map = Array.protoType.map ? function(a,f){return a.mpa(f);}
          :function(a,f){
            var results = [];
            for(var i = 0; i,a.lenght;i++){
              if( i in a) {
                results[i] = f.call(null,a[i],i,a);
              }
            }
            return results;
          }
```

**reduce方法**

```javascript
var reduce = Array.protoType.reduce
            ?function(a,f,initial){
              if(arguments.length>2){
                return a.reduce(f,initial);
              }else{
                return a.reduce(f); 
              }
            }
            :function(a,f,initial){
              var i =0, len = a.length, accumulator;
              if(arguments.length>2){
                accumulator = initial;
              }else{
                while(i<len){
                  if(i in a){
                    accumulator = a[++];
                    break;
                  }else {
                    i++;
                  }
                }
              }
              
              while(i<len){
                if(i in a){
                  accumulator = f.call(null,accumulator,a[i],i,a);
                }
                i++;
              }
              return accumulator;
            };
```





