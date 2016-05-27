##第一章、背景与边框
###1、[半透明边框](http://play.csssecrets.io/translu-cent-borders)
```
主要是`background-clip:padding-box`;
```
###2、[多重边框](http://play.csssecrets.io/multiple-borders)
> 可是使用`box-shadow`以及`outline`来模拟多边框

###3、灵活的背景定位
1、[background-position拓展语法方案](http://play.csssecrets.io/extended-bg-position)

2、[background-origin方案](http://play.csssecrets.io/background-origin)

3、[calc()方案](http://play.csssecrets.io/background-position-calc)

###4、[边框内圆角](http://play.csssecrets.io/inner-rounding)

###5、条纹背景
1、[水平条纹背景](http://play.csssecrets.io/horizontal-stripes)

2、[垂直条纹背景](http://play.csssecrets.io/vertical-stripes)

3、[斜向条纹背景](http://play.csssecrets.io/diagonal-stripes)

4、[更好的斜向条纹背景](http://play.csssecrets.io/diagonal-stripes-60deg)
主要是运用了渐变的一个新的属性
```
background:repeat-linear-gradient(60deg,green 15px,blue 0,blue 30px);
```
5、[灵活的同色系条纹](http://play.csssecrets.io/subtle-stripes)
> 这个想法挺棒的！

###6、复杂的背景图案
1、[网格](http://play.csssecrets.io/blueprint)
> [CSS3图案库](http://lea.verou.me/css3patterns),这里面展示了CSS渐变早在2011年就能实现的效果。
> [SVG版本](http://philbit.com/svgpatterns)这个里面的是上面的CSS3图案库的svg版本

2、[波点](http://play.csssecrets.io/polka)

3、[棋盘](http://play.csssecrets.io/checkerboard) [棋盘的SVG实现方法](http://play.csssecrets.io/checkerboard-svg)

4、[角向渐变](http://play.csssecrets.io/test-conic-gradient)

5、一个有意思的图案库[Bennett Feely的图案库](http://bennttfeely.com/gradient)

###7、[伪随机背景](http://play.csssecrets.io/cicada-stripes)
> 这项原则又被成为「蝉原则」

###8、连续的图像边框
1、[border-image的使用](http://play.csssecrets.io/border-image)

2、[持续的图片边框](http://play.csssecrets.io/continuous-border-image)

3、[老式信封的边框](http://play.csssecrets.io/vintage-envelope)

4、[蚂蚁行军般的动态边框](http://play.csssecrets.io/marching-ants)

5、[模仿传统的脚注](http://play.csssecrets.io/footnote)

##第二章、形状
###9、自适应的椭圆
1、[自适应的椭圆](http://play.csssecrets.io/ellipse)

2、[半椭圆](http://play.csssecrets.io/half-ellipse)

3、[四分之一椭圆](http://play.csssecrets.io/quarter-ellipse)

4、[各种形状的糖果按钮](http://simurai.com/archives/buttons)

###10、平行四边形
1、[嵌套元素方案](http://play.csssecrets.io/parallelograms)

2、[伪元素方案](http://play.csssecrets.io/parallelograms-pseudo)

###11、菱形图片
1、[基于变形的方案](http://play.csssecrets.io/diamond-images)

2、[剪切路径的方案](http://play.csssecrets.io/diamond-clip)

###12、切角效果
1、[基于渐变的方案](http://play.csssecrets.io/bavel-corners-gradients)

2、[弧形切角](http://play.csssecrets.io/scoop-corners)

3、[内联SVG与border-image的方案](http://play.csssecrets.io/bavel-corners)

4、[剪切路径的方案](http://play.csssecrets.io/bavel-corners-clipped)

###13、[梯形标签页](http://play.csssecrets.io/trapezoid-tabs)

###14、简单的饼图
1、[基于transform的解决方案](http://play.csssecrets.io/pie-animated)

2、[不同比率的静态饼图](http://play.csssecrets.io/pie-static)

3、[svg的解决方案](http://play.csssecrets.io/pie-svg)

###第三章、视觉效果
###15、单侧投影
1、[单侧投影](http://play.csssecrets.io/shadow-one-side)

2、[临边投影](http://play.csssecrets.io/shadow-2-sides)

3、[对侧投影](http://play.csssecrets.io/shadow-opposite-sides)

###16、[不规则投影](http://play.csssecrets.io/drpo-shadow)

###17、染色效果
1、[基于滤镜的方案](http://play.csssecrets.io/color-tint-filter)

2、[基于混合模式的方案](http://play.csssecrets.io/color-tint)

###18、[毛玻璃效果](http://play.csssecrets.io/frosted-glass)

###19、折角效果
1、[45°角的解决方案](http://play.csssecrets.io/folded-corner)

2、[其他角度的解决方案](http://play.csssecrets.io/folded-corner-mixin)

##第四章、字体排印
###20、[连字符断行](http://play.csssecrets.io/hyphenation)

###21、[插入换行](http://play.csssecrets.io/line-breaks)

###22、[文本行的斑马条纹](http://play.csssecrets.io/zebra-lines)

###23、[调整tab的宽度](http://play.csssecrets.io/tab-size)

###24、[连字](http://play.csssecrets.io/ligatures)

###25、[华丽的&符号](http://play.csssecrets.io/ampersands)

###26、自定义下划线
1、[普通下划线](http://play.csssecrets.io/underlines)

2、[波浪下划线](http://play.csssecrets.io/wavy-underlines)

###27、现实中的文字效果
1、[凸版印刷体效果](http://play.csssecrets.io/letterpress)

2、[空心字效果](http://play.csssecrets.io/stroked-text)

3、[文字外发光效果](http://play.csssecrets.io/glow)

4、[文字凸起的效果](http://play.csssecrets.io/extruded)

###28、[环形文字的实现效果](http://play.csssecrets.io/circular-text)

##第五章、用户体验

###29、选择合适用的鼠标
1、[CSS基本UI特性](http://w3.org/TR/css3ui/#-cursor)

2、[提示禁用状态](http://play.csssecrets.io/disabled)

###30、扩大可点击区域
1、[Fitts法则](http://simonwallner.at/ext/fitts)

2、[利用border的解决方案](http://play.csssecrets.io/hit-area-border)

3、[利用伪元素的解决方案](http://play.csssecrets.io/hit-area)

###31、自定义复选框
1、[解决方案](http://play.csssecrets.io/checkboxes)

2、[开关按钮](http://play.csssecrets.io/toggle-buttons)

###32、通过阴影来弱化背景
1、[伪元素方案]

2、[box-shadow方案](http://play.csssecrets.io/dimming-box-shadow)

3、[backdrop方案](http://play.csssecrets.io/native-model)

###33、[通过模糊来弱化背景](http://play.csssecrets.io/deemphasizing-blur)

###34、[滚动提示](http://play.csssecrets.io/scrolling-hints)

###35、交互式的图片对比控件
1、[CSS resize方案](http://play.csssecrets.io/image-slider)

2、[范围输入控件]

##第六章、结构与布局
###36、[自适应内部元素](http://play.csssecrets.io/intrinsic-sizing)
###37、[精确控制列表宽度](http://play.csssecrets.io/table-column-widths)
###38、[根据兄弟元素的数量来设置样式](http://play.csssecrets.io/styling-sibling-count)
###39、[满幅的背景，定宽的内容](http://play.csssecrets.io/fluid-fixed)
###40、垂直居中
1、[基于绝对定位的解决方案](http://play.csssecrets.io/vertical-centering-abs)

2、[基于视口单位的解决方案](http://play.csssecrets.io/vertical-centering-vh)

3、[基于Flexbox的解决方案](http://play.csssecrets.io/vertical-centering)

###41、紧贴底部的页脚
1、[固定高度的解决方案](http://play.csssecrets.io/sticky-footer-fixed)

2、[更灵活的解决方案](http://play.csssecrets.io/sticky-footer)

##第七章、过渡与动画
###42、缓动效果
1、[弹跳效果](http://play.csssecrets.io/bounce)

2、[弹性过渡](http://play.csssecrets.io/elastic)

###43、[逐帧动画](http://play.csssecrets.io/frame-by-frame)

###44、[闪烁效果](http://play.csssecrets.io/blink)
###45、[打字效果](http://play.csssecrets.io/typing)
###46.[状态平滑的动画](http://play.csssecrets.io/state-animations)
###47.环形路径平移的动画
1、[两个元素的解决方案](http://play.csssecrets.io/circular-2elements)

2、[一个元素的解决方案](http://play.csssecrets.io/circular)

