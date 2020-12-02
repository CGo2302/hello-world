const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf8');
const chinzo_page = fs.readFileSync('./chinzo.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');


var server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start');

function getFromClient(request,response){
    var url_parts = url.parse(request.url, true);
    switch (url_parts.pathname){
        case '/':
            var content = "これはIndexページです。"
            var query = url_parts.query;
            if(query.msg != undefined){
                var query_obj = content += 'あなたは、「' + query.msg + '」と送りました。';
            }
            response_index(request, response);
            break;

        case '/other':
            response_other(request, response);
            break;

        case '/chinzo':
            response_chinzo(request, response);
            break;

        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(style_css);
            response.end();
            break;

        default:
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('no page...');
            break; 
    }

}

var data3 = {msg:'no message...'};

function response_index(request, response){
    if(request.method == 'POST'){
        var body='';

        request.on('data', (data) => {
            body +=data;
        });
        request.on('end',() => {
            data3 = qs.parse(body);
            setCookie('msg', data3.msg, response)
            write_index(request, response);            
        });
    } else {
        write_index(request, response); 
    }
}

function write_index(request, response) {
    var msg = "伝言を表示します。"
    var cookie_data = getCookie('msg', request);
    var content = ejs.render(index_page, {
        title:"Index", 
        content:msg,
        data:data3,
        cookie_data:cookie_data,
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

function setCookie(key, value, response) {
    var cookie = escape(value);
    response.setHeader('Set-Cookie',[key + '=' + cookie]);
}

function getCookie(key, request) {
    var cookie_data = request.headers.cookie != undefined ? request.headers.cookie : '';
    var data = cookie_data.split(';');
    for(var i in data){
        if (data[i].trim().startsWith(key + ('='))){
            var result = data[i].trim().substring(key.length + 1);
            return unescape(result);
        }
    }
    return '';
}

var data2 = {
    'Taro':['Taro@yamada', '09-999-999', 'Tokyo'],
    'Hanoko':['Hanoko@yamada', '09-999-888', 'Yokohama'],
    'Ichiro':['Ichiro@flower', '09-999-777', 'Nagoya'],
    'Sachiko':['Sachiko@volleyball', '09-999-666', 'Kyoto'],
};

function response_other(request, response){
    var msg = "これはOtherページです。"
    var content = ejs.render(other_page, {
        title:"Other", 
        content:content,
        data:data2,
        filename:'data_item'
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

function response_chinzo(request, response){
    var msg = "これはChinzoページです。"
    if(request.method == 'POST'){
        var body='';

        request.on('data', (data) => {
            body +=data;
        });

        request.on('end',() => {
            var post_data = qs.parse(body);
            msg += 'あなたは、「' + post_data.msg + '」と書きました。';
            
            var content = ejs.render(chinzo_page, {
                title:"Chinzo", 
                content:msg,
            });
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(content);
            response.end();
            
        });
    } else {
        var msg = "ページがありません";
        var content = ejs.render(chinzo_page, {
            title:"Chinzo", 
            content:msg,
        });
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(content);
        response.end();
    }
}