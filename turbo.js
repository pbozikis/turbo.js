//High level routing and Templating for node.js
let routes = {};
const http = require('http');
const fs = require('fs');
let _ = require('lodash');
const AsyncFunction = (async () => {}).constructor;

function tparse(chungus)
{
    let obj = {};
    let arr = chungus.split('&');
    arr.forEach(x => {
        console.log(x);
        let roo = x.split('=');
        obj[roo[0]] = roo[1];
    });
    return obj;
}

module.exports.Route = function (root, callback)
{
    routes[root] = {};
    //Check route syntax for file types
    if(callback instanceof AsyncFunction)
    {
        console.log("ah yes");
    }
    routes[root].callback = callback;
}

module.exports.format = function(path, v)
{
    path = __dirname + '\\' + path;
    let data = fs.readFileSync(path, 'utf8').toString();
    //Might still be greedy


   //Turbo for loop
    data = data.replace(/<<turbo for (?<item>.+?) in (?<array>.+?)>>(?<content>[\s\S]*)<<\/turbo for>>/g, function(match, item, array, content)
    {
        let newstring = '';
       for(let thing of _.get(v, array))
       {
           const reggie = new RegExp(`<<${item}(.*?)>>`, 'g');
           newstring += content.replace(reggie, function(match, part2){
                return eval("thing"+part2)//_.get(thing, part2);
           });
       }
       return newstring;
    });
    //Turbo img loading
    data = data.replace(/<<turbo img (?<extras1>.*?)src="(?<file>.+?)"(?<extras2>.*?)>>/g, function(match, extras1, file, extras2)
    {
        let imgEncoded = fs.readFileSync(__dirname+"\\"+file).toString("base64");
        return '<img src="data:image/jpg;base64,'+imgEncoded+'"'+extras1+extras2+'>';
    });

    //Turbo variables
    data = data.replace( /<<(.+?)>>/g, function(match, token)
    {
        return _.get(v, token);
    });
    return data;
}
function checkUrl(url)
{
    //if normal route exists
    if(routes.hasOwnProperty(url))
    {
        //console.log("[!] Has own property");
        return url;
    }
    //if variable route exists
    if(!url.includes('.'))
    {
        for(let root of Object.keys(routes))
        {
            //split bothy
            let rsplit = root.replace(/<.+?>/g, '!!').split('/');
            let usplit = url.split('/');
            if(rsplit.length == usplit.length)
            {
                let i = 0;
                while((usplit[i] === rsplit[i] || rsplit[i] === '!!') && i < usplit.length) i++;
                if(i == usplit.length)
                {
                   // console.log("[!] Has GET property");

                    return(root);
                }
            }
        }
    }
    //console.log("[!] NAAN");

    return false;

}

module.exports.Listen = function(port)
{
    let server = http.createServer(function(req, res){
        
        //Check url received
        let nurl = checkUrl(req.url);
        if(nurl)
        {
            try{
                res.writeHead(200);
                let x = req.url.split('/');
                if(routes[nurl].callback instanceof AsyncFunction)
                {
                    routes[nurl].callback(x[x.length-1]).then(ret => {
                        res.write(ret);
                        res.end();
                    });
                } else{
                    res.write(routes[nurl].callback(x[x.length - 1]));
                    res.end();
                }
            }
            catch(error){
                console.log("ERROR: "+error+", while trying to access: "+request.url);
            }
        } else{
            try{
                nurl = req.url.split('/');
                nurl = nurl[nurl.length -1];
                console.log("Nurl: "+ nurl);
                res.write(fs.readFileSync(__dirname+'\\'+nurl));
                res.end();
            }
            catch(error){
                console.log("ERROR: "+error+", while trying to access: "+req.url);
            }
        }
        console.log(req.method+" request handled @ "+req.url);
        

    });
    server.listen(port);
    console.log("Server running @ http://127.0.0.1:"+port+"/");
}
/*
module.exports.Listen = function(port)
{
    let server = http.createServer(function(request, response){
        
        //CHeck URL
        //cases are POST->Callback, GET->callback or send misc file
        let nurl = checkUrl(request.url);
        if(nurl != false)
        {
            if(request.method == "POST")
            {
                let body = '';
                request.on('data', (data)=>{
                    body += data.toString();
                }).on('end', () => {
                    response.write(routes[nurl].callback(tparse(body)))
                    response.end();
                });

            }else{//GET
                try{
                    response.writeHead(200);
                    let x = request.url.split('/');
                    response.write(routes[nurl].callback(x[x.length - 1]));
                    response.end();
                }
                catch(error){
                    console.log("ERROR: "+error+", while trying to access: "+request.url);
                }
            }

        } else {//If no route, handle normally all GET
            try{
                nurl = request.url.split('/');
                nurl = nurl[nurl.length -1];
                console.log("Nurl: "+ nurl);
                response.write(fs.readFileSync(__dirname+'\\'+nurl));
                response.end();
            }
            catch(error){
                console.log("ERROR: "+error+", while trying to access: "+request.url);
            }
        }
        console.log(request.method+" request handled @ "+request.url);
    });
    server.listen(port);
    console.log("Server running @ http://127.0.0.1:"+port+"/");

}*/