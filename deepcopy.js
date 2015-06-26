var deepCopy= function(source) {
    var result={};
 
    for (var key in source) {
        result[key] = typeof source[key]===’object’? deepCoyp(source[key]): source[key];
     }
     
   return result;
}

//下面是zepto中有关extend函数实现方法。 
//道理和深复制异曲同工。
//下面代码并不能直接运行。
function extend(target, source, deep) {
  for (key in source)
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key]))
        target[key] = {}
      if (isArray(source[key]) && !isArray(target[key]))
        target[key] = []
      extend(target[key], source[key], deep)
    }
    else if (source[key] !== undefined) target[key] = source[key]
}
