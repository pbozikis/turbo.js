const puppeteer = require('puppeteer');
module.exports =  async function cheese(text, target)
{
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(`https://translate.google.com/?sl=en&tl=${target}&text=${text}&op=translate`);
  await page.waitForSelector(".VIiyi");
  let translations = (await page.evaluate(() =>{
  return document.body.innerHTML.match(/W297wb.+?>(.+?)<.+jTaUub.+?>(.+?)</).slice(1);
        //W297wb.+?>(.+?)<.+jTaUub.+?>(.+?)<
  }));
  browser.close();
  return translations;
    //await browser.close();
}