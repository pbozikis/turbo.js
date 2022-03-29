const turbo = require("./turbo");
const translate = require("./quinn");

turbo.Route('/getQ', async function(req =""){
    let result = await translate("Hello, how are you?", "ml");
    return JSON.stringify(result);
});


turbo.Route('/', function(req)
{
    return(turbo.format('./home.html', {}));
});

turbo.Route('/learn', function(req)
{
    return(turbo.format('./learn.html', {}));
});

turbo.Listen(5000);