var http = require('http');
var url = require('url');
var fs = require('fs');
var getFile = function (path, response) {
    fs.readFile(path, function (err, data) {
        if (err) {
            response.writeHead(404);
            response.end('not found');
        } else {
            response.end(data);
        }
    });
};

var gif = fs.readFileSync('./st.gif');
var count = {};
var allow = ['http://localhost:12345', 'http://localhost:63342'];
var server = http.createServer(function (request, response) {
    var params = url.parse(request.url, true);
    if (params.pathname == '/ajax') {
        response.write('hello world');
        response.end();
    } else if (params.pathname == '/cross') {
        var query = params.query;
        response.writeHead(200,
            {'content-type': 'application/json'});
        response.end(query.name + '(' + JSON.stringify([
                {name: 'a', age: '1'},
                {name: 'b', age: '2'},
                {name: 'c', age: '3'},
                {name: 'd', age: '4'}
            ]) + ');'
        );
    } else if (params.pathname == '/tongji') {
        var origin = request.headers['referer'];
        if (origin) {
            var hostname = url.parse(origin);
            hostname = hostname.protocol + '//' + hostname.host;
            var times = count[hostname];
            if (times === undefined) {
                count[hostname] = 1;
            } else {
                count[hostname]++;
            }
            console.log(count);
        }
        response.writeHead(200, {'content-type': 'image/gif'});
        response.write(gif);
        response.end();
    } else if (params.pathname == '/cors') {
        var _origin = request.headers['origin'];
        if (_origin && allow.indexOf(_origin) > -1) {
            response.writeHead(200, {
                'Access-Control-Allow-Origin': _origin,
                'Access-Control-Allow-Credentials':true,
                'Set-Cookie':'name=server'
            });
        }
        response.end(JSON.stringify([
            {class: '1', name: 'asd'},
            {class: '3', name: 'd'},
            {class: '4', name: 'xc'},
            {class: 's', name: 'sd'}
        ]));
    } else {
        getFile('..' + params.pathname, response);
//        response.end('not supported');
    }
});
// 端口最大值为65535
server.listen(3000, function () {
    console.log('start at 3000');
});