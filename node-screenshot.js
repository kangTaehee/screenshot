const puppeteer = require('puppeteer');
const fs = require('fs');
var remaining = '';
var urls = [];
const es = require('event-stream');

function getFileContents(fileName){
const results = [];
const stream = fs.createReadStream(fileName)
	.pipe(es.split())                 // default : \n으로 스플릿
	.pipe(es.map(function(line, cb){
	results.push(line);

	//todo : do something with the line
	cb(null, line)
	}))
;
return new Promise((resolve, reject) => {
	stream.on('error', function(err){
	console.log('File read Error.');
	resolve(reject);
	})

	stream.on('end', function(){ // nodejs에서 Stream은 기본적으로 event emitter이다.
	console.log('ReadStream End.');
	resolve(results);  // Array 반환
	})
})
}

(async () => {

	const file_name = "list.txt";
	const data = await getFileContents(file_name);
	console.log('목록 : ',data);

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		console.log('star => ',element)
		// takeScreenshot(element)
		
		// 3. Navigate to URL
		await page.setViewport ({width : 320, height : 480});
		// console.log(urls)
		await page.goto(element);
		// Get the "viewport" of the page, as reported by the page.
		const dimensions = await page.evaluate(() => {
			return {
				width: 360,
				height: document.documentElement.scrollHeight,
				deviceScaleFactor: window.devicePixelRatio
			};
		});
		// console.log(dimensions)
		await page.setViewport(dimensions);
		// await page.setViewport ({width : 320, height : 480});
		// await page.waitForNavigation({waitUntil: 'networkidle2'});
		console.log(index)
		fileN = element.split('=')[1]
		// await console.log('filepathname :     ',filepathname)
		await page.screenshot({
			path: `${fileN}${index}-320.png`,
			type: "png"
		});

		await page.setViewport ({width : 768, height : 768});
		const dimensions2 = await page.evaluate(() => {
			return {
				width: 768,
				height: document.documentElement.scrollHeight,
				deviceScaleFactor: window.devicePixelRatio
			};
		});
		// console.log(dimensions2)
		await page.setViewport(dimensions2);
		await page.screenshot({
			path: `${fileN}${index}-768.png`,
			type: "png"
		});
		// 4. Take screenshot
		await page.setViewport ({width : 1200, height : 480});
		await page.screenshot({
			path: `${fileN}${index}-full.png`,
			fullPage: true
		});
		
	}
	await browser.close();

})();

async function takeScreenshot(element) {
	return browser.newPage().then(async (page) => {
		await page.setViewport ({width : 320, height : 480});
		// console.log(urls)
		await page.goto(element);
		// Get the "viewport" of the page, as reported by the page.
		const dimensions = await page.evaluate(() => {
			return {
				width: 360,
				height: document.documentElement.scrollHeight,
				deviceScaleFactor: window.devicePixelRatio
			};
		});
		// console.log(dimensions)
		await page.setViewport(dimensions);
		// await page.setViewport ({width : 320, height : 480});
		// await page.waitForNavigation({waitUntil: 'networkidle2'});
		console.log(index)
		var f1 = index+'-320.png'
		var f2 = index+'-full.png'
		// await console.log('filepathname :     ',filepathname)
		await page.screenshot({
			path: `${index}.png`,
			type: "png"
		});
		// 4. Take screenshot
		await page.setViewport ({width : 1200, height : 480});
		await page.screenshot({path: f2 ,fullPage: true});
		await browser.close();
	});
}