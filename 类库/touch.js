(function () {
    var touch = {};

    //柯理化函数
    function bind(context, callBack) {
        var outerArg = [].slice.call(arguments, 2);
        return function () {
            var innerArg = [].slice.call(arguments, 0);
            var arg = innerArg.concat(outerArg);
            callBack.apply(context, arg);
        }
    }

    //检测是否是滑动事件
    function isSwipe(strX, endX, strY, endY) {
        return Math.abs(endX - strX) > 30 || Math.abs(endY - strY) > 30;
    }

    //检测当前滑动的方向
    function swipeDirection(strX, endX, strY, endY) {
        return Math.abs(endX - strX) > Math.abs(endY - strY) ? ((endX - strX) > 0 ? "Right" : "Left") : ((endY - strY) > 0 ? "Down" : "Up");
    }

    //开始编写事件的三步操作:touchStart、touchMove、touchEnd
    //name:我们模拟的事件类型"tap", "swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown"
    //callback:每一阶段我们单独处理的事情
    function touchStart(e, name, callback) {
        e.preventDefault();
        var touchPoint = e.touches[0];
        this["strX" + name] = touchPoint.pageX;
        this["strY" + name] = touchPoint.pageY;
        typeof callback === "function" ? callback.call(this, e) : null;
    }

    function touchMove(e, name, callback) {
        e.preventDefault();
        var touchPoint = e.touches[0];
        this["endX" + name] = touchPoint.pageX;
        this["endY" + name] = touchPoint.pageY;
        this["isSwipe" + name] = isSwipe(this["strX" + name], this["endX" + name], this["strY" + name], this["endY" + name]);
        checkEvent.call(this, e, name, callback);
    }

    function touchEnd(e, name, callBack) {
        e.preventDefault();
        checkEvent.call(this, e, name, callBack);
        initDefault.call(this, e, name);
    }

    //根据传递进来的事件类型和当前用户的行为进行比较,最后判断是否进行触发
    function checkEvent(e, name, callBack) {
        var isSwipe = this["isSwipe" + name];
        switch (name) {
            case "tap":
                !isSwipe && typeof callBack === "function" ? callBack.call(this, e) : null;
                break;
            case "swipe":
                isSwipe && typeof callBack === "function" ? callBack.call(this, e) : null;
                break;
            default:
                if (isSwipe) {
                    var swipeDir = swipeDirection(this["strX" + name], this["endX" + name], this["strY" + name], this["endY" + name]);
                    if (name === "swipe" + swipeDir) {
                        typeof callBack === "function" ? callBack.call(this, e) : null;
                    }
                }
        }
    }

    //在touch事件结束后把设置的自定义属性值回归到原始的状态
    function initDefault(e, name) {
        ["strX", "endX", "strY", "endY", "isSwipe"].forEach(function (item) {
            this[item + name] = null;
        }, this);
    }


    //options:{start:function->开始做的事情 move:function->滑动做的事情 end:function->结束做的事情}
    function init(name) {
        return function (curEle, options) {
            ["start", "move", "end"].forEach(function (item) {
                var fn = item === "start" ? touchStart : (item === "move" ? touchMove : touchEnd);
                var tempFn = bind(curEle, fn, name, options[item]);
                curEle["my" + item + name] = tempFn;
                curEle.addEventListener("touch" + item, tempFn, false);
            });
            return this;//->为了实现链式写法
        }
    }

    function uninit(curEle) {
        ["tap", "swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown"].forEach(function (name) {
            ["start", "move", "end"].forEach(function (item) {
                var tempFn = curEle["my" + item + name];
                curEle.removeEventListener("touch" + item, tempFn, false);
            });
        });
    }

    ["tap", "swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown"].forEach(function (item) {
        touch[item] = init(item);
    });
    touch.uninit = uninit;

    window.zhufengTouch = window.$t = touch;
})();