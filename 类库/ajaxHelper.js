/**
 * @file ajaxHelper.js
 */

/**
 * 1 保护内部变量,不受外部修改
 */
(function () {
    // 为了防止重复加载
    if (this.x) {
        return;
    }

    // 给window声明一个x变量为一个对象
    var x = this.x = {};

    // 默认的参数配置项
    var settings = {
        //  请求的路径
        url: '',
        // 使用什么http方法
        type: '',
        // 发送给服务器的数据
        data: {},
        // 是否走缓存
        cache: false,
        // 是否异步
        async: true,
        // 用户名
        username: undefined,
        // 密码
        password: undefined,
        // 服务器响应的类型 text||json
        dataType: 'text',
        // 成功时调用的函数
        success: function () {
        },
        // 失败时调用的函数
        error: function () {
        },
        // 超时毫秒 为0时代表不走超时逻辑
        timeout: 0,
        // 自定义头信息
        headers: {},
        // success和error函数里的上下文对象
        context: window
    };

    // 省劲 省去了敲5次键盘
    // 核心函数
    x.$http = function (opt) {
        // 判断参数是否为一个对象
        if (!util.isObject(opt)) {
            throw new Error('参数必须是一个对象');
        }
        // 生成一个新的配置参数列表
        // 为了防止修改默认参数列表和用户传进来的参数
        var _opt = {};
        for (var n in settings) {
            if (!settings.hasOwnProperty(n)) continue;
            _opt[n] = opt[n] || settings[n];
        }
        // 获取ajax实例
        var xhr = util.getXHR();

        // 判断http方法是否合法
        if (!/^(get|post|head|delete|put|options)$/ig.test(_opt.type)) {
            throw new Error('http方法不合法')
        }
        // encodeURIComponent() 把参数转义为URI的格式
        // encodeURI() 把参数转换为URI的格式,但是url里头的组件不转义 (?#:@/)
        // 如果用户输入的data为一个对象,那么就把这个对象转换为URI格式的字符串
        if (util.isObject(_opt.data)) {
            var arr = [];
            for (n in _opt.data) {
                if (!_opt.data.hasOwnProperty(n)) continue;
                arr.push(encodeURIComponent(n) + '=' + encodeURIComponent(_opt.data[n]));
            }
            _opt.data = arr.join('&');
        }

        // 因为get系需要把data拼接到URL后面,需要判断有没有"?"
        if (/^(get|delete|head)$/ig.test(_opt.type)&&_opt.data) {
            /* if(/\?/.test(_opt.url)){
             _opt.url+='&'+_opt.data;
             }else{
             _opt.url+='?'+_opt.data;
             }*/
            _opt.url += (/\?/.test(_opt.url) ? '&' : '?') + _opt.data;
            _opt.data = null;
        }

        // 处理缓存
        if (_opt.cache === false) {
            var random = (~~(Math.random() * 0xffffff)).toString(36);
            _opt.url += (/\?/.test(_opt.url) ? "&" : '?') + '_=' + random;
        }
        // 建立一个http连接
        xhr.open(_opt.type, _opt.url, _opt.async, _opt.username, _opt.password);

        // 注册监听状态的函数
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
                var txt = xhr.responseText;
                // 判断用户参数的dataType是否为json,如果是json则把响应主体转换为json对象
                if (_opt.dataType.toUpperCase() === 'JSON') {
                    try {
                        // 如果响应不是有效的json字符串,执行JSONParse会报错,所以需要加上try
                        txt = util.JSONparse(txt);
                    } catch (e) {
                        _opt.error(e);
                        // 报错之后,后续都不需要走了,所以就return回去,终止该方法的执行
                        return;
                    }
                }
                // 执行成功逻辑
                _opt.success(txt);
            }
        };
        // 处理超时逻辑
        if (util.isNumber(_opt.timeout) && _opt.timeout > 0) {
            if ('timeout' in xhr) {
                // 标准浏览器
                // 超时毫秒数
                xhr.timeout = _opt.timeout;
                // 超时执行的函数
                xhr.ontimeout = function () {
                    _opt.error();
                }
            } else {
                // 兼容低版本ie
                setTimeout(function () {
                    // 超时时间已到,并且状态还没有为4,强制终止
                    if (xhr.readyState !== 4) {
                        // 强制终止
                        xhr.abort();
                    }
                }, _opt.timeout);
            }
        }

        // 在上头get系已经处理了data为null
        // 发送http请求
        xhr.send(_opt.data);


    };

    // 利用闭包 来实现一个判断对象类型的逻辑
    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        }
    };
    var util = {
        // 利用惰性函数实现获取当前浏览器最合适的那个ajax对象
        getXHR: (function () {
            var list = [
                function () {
                    return new XMLHttpRequest()
                },
                function () {
                    return new ActiveXObject('Microsoft.XMLHTTP')
                },
                function () {
                    return new ActiveXObject('Msxml2.XMLHTTP')
                },
                function () {
                    return new ActiveXObject('Msxml3.XMLHTTP')
                }
            ], xhr;
            while (xhr = list.shift()) {
                try {
                    xhr();
                    break;
                } catch (e) {
                    xhr = null;
                    continue;
                }
            }
            if (xhr !== null) {
                return xhr;
            }
            throw new Error('当前浏览器不支持此对象');
        })(),
        // 利用惰性函数实现循环的逻辑
        each: (function () {
            if ([].forEach) {
                return function (list, callback, context) {
                    [].forEach.call(list, callback, context);
                }
            }
            return function (list, callback, context) {
                for (var i = 0, l = list.length; i < l; i++) {
                    callback.call(context, list[i], i, list)
                }
            }
        })(),
        // 给util对象动态添加属性
        init: function () {
            this.each(['String', 'Object', 'Number', 'Array', 'Function'], function (item) {
                util['is' + item] = isType(item);
            })
        },
        JSONparse: (function () {
            if (window.JSON) {
                return function (str) {
                    return JSON.parse(str);
                }
            }
            // 兼容ie6 7
            return function (str) {
                //return eval('(' + str + ')');
                return (new Function('return ' + str))();
            };
        })()
    };
    util.init();
})();