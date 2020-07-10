var yyy = document.getElementById('xxx');
var context = yyy.getContext('2d');
// 默认线宽
var lineWidth = 5;
// 记录画的图形（坐标）
let canvasHistory = [];
// 步数
let step = -1;
var c1;

autoSetCanvasSize(yyy)

listenToMouse(yyy)

// 橡皮擦  撤销的开关
var eraserEnabled = false
// 线宽选择
function lineChoose(lineType, num) {
    lineType.onclick = function () {
        lineWidth = num;
        for (var i = 0; i < lineType.parentNode.children.length; i++) {
            lineType.parentNode.children[i].classList.remove('active')
        }
        lineType.classList.add('active')
    }
}
// 颜色选择
function colorFun(colorType, type) {
    colorType.onclick = function () {
        context.strokeStyle = type;
        for (var i = 0; i < black.parentNode.children.length; i++) {
            black.parentNode.children[i].classList.remove('active')
        }
        colorType.classList.add('active')
    }
}
colorFun(black, 'black');
colorFun(white, 'white');
colorFun(red, 'red');
colorFun(pink, 'pink');
colorFun(green, 'green');
colorFun(yellow, 'yellow');
colorFun(skyblue, 'skyblue');
colorFun(blue, 'blue');

lineChoose(one, 3);
lineChoose(two, 6);
lineChoose(three, 9);
lineChoose(four, 12);
lineChoose(five, 15);
lineChoose(six, 18);
lineChoose(seven, 21);

// 清空 全部清空  清空画布
clear.onclick = function () {
    context.clearRect(0, 0, yyy.width, yyy.height)
}
// 保存  将前画布保存为 png图到本地
save.onclick = function () {
    // 将画布存为 png图片
    var url = yyy.toDataURL('image/jpg')
    // 创建a标签
    var a = document.createElement('a')
    // 添加到html中
    document.body.appendChild(a)
    // 赋值属性
    a.href = url
    // 指定下载属性 及 图片名字
    a.download = '我的画板'
    // 打开新窗口保存
    a.target = '_blank'
    a.click()
}
// 撤销
cancel.onclick = function () {

    if (step >= 0) {
        step--;
        context.clearRect(0, 0, yyy.width, yyy.height)
        // 调用了canvas中putImageData方法 添加、删除记录的一个方法
        context.putImageData(canvasHistory[step], 0, 0)
        console.log(step, context)
    } else {
        console.log('不能再继续撤销了');
    }
}

/******/
// 把html当做了画板，html多大，画板就多大   
function autoSetCanvasSize(canvas) {
    // 初始化画板大小
    setCanvasSize()
    // 浏览器窗口变化时，重新调用此方法
    window.onresize = function () {
        setCanvasSize()
    }

    function setCanvasSize() {
        var pageWidth = document.documentElement.clientWidth
        var pageHeight = document.documentElement.clientHeight

        canvas.width = pageWidth
        canvas.height = pageHeight
    }
}
// 画线
function drawLine(x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1) // 起点
    context.lineWidth = lineWidth
    context.lineTo(x2, y2) // 终点
    context.stroke()
    context.closePath()
}

// PC端和移动端事件兼容函数
function eventFun() {
    // ontouchstart 触摸事件
    // ontouchmove  手指移动事件
    // ontouchend   手指离开事件
    var start = document.body.ontouchstart === undefined ? 'mousedown' : 'touchstart';
    var move = document.body.ontouchmove === undefined ? 'mousemove' : 'touchmove';
    var end = document.body.ontouchend === undefined ? 'mouseup' : 'touchend';
    return {
        start,
        move,
        end
    }
}
// 监听鼠标的坐标   飞机大战  JS封装的动画
function listenToMouse(canvas) {
    // 开始记录坐标的 标识
    var using = false
    // 此时坐标都是undefined
    var lastPoint = {
        x: undefined,
        y: undefined
    }
    let { start, move, end } = eventFun();

    function movefun(aaa) {
        var x = start != 'touchstart' ? aaa.clientX : aaa.touches[0].clientX;
        var y = start != 'touchstart' ? aaa.clientY : aaa.touches[0].clientY;
        using = true
        if (eraserEnabled) {
            context.clearRect(x - 5, y - 5, 10, 10)
        } else {
            var newPoint = {
                "x": x,
                "y": y
            }
            drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
            // 把最新的坐标给 原来的旧坐标  方便更新坐标
            lastPoint = newPoint;
        }
    }

    // 特性检测  if 是PC端的鼠标事件   else是移动端 手势事件 
    canvas.addEventListener(start, aaa => {
        // 移动端的 X Y坐标和PC端有区别
        // PC端鼠标坐标：  x:事件源.clientX  y:事件源.clientY
        // 移动端端坐标：  x:事件源.touches[0].clientX  y:事件源.touches[0].clientY
        var x = start != 'touchstart' ? aaa.clientX : aaa.touches[0].clientX;
        var y = start != 'touchstart' ? aaa.clientY : aaa.touches[0].clientY;
        using = true;
        // 清除 
        if (eraserEnabled) {
            context.clearRect(x - 5, y - 5, 10, 10)
        } else {
            lastPoint = {
                "x": x,
                "y": y
            }
        }
        canvas.addEventListener(move, movefun);
    });

    canvas.addEventListener(end, aaa => {
        // 不再记录坐标
        using = false
        step++;
        // 把绘画的图像（坐标）添加到数组中
        canvasHistory.push(context.getImageData(0, 0, yyy.width, yyy.height))
    });

    document.body.addEventListener('mouseup', () => {
        yyy.removeEventListener('mousemove', movefun)
    })
}

