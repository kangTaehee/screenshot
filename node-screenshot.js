const puppeteer = require('puppeteer');
const fs = require('fs');
var remaining = '';
var urls = [];
const es = require('event-stream');
var browser
var data
function arrayReadFile(fileName) {
	const results = [];
	const stream = fs.createReadStream(fileName)
		.pipe(es.split())                 // default : \n으로 스플릿
		.pipe(es.map(function (line, cb) {
			results.push(line);

			//todo : do something with the line
			cb(null, line)
		}))
		;
	return new Promise((resolve, reject) => {
		stream.on('error', function (err) {
			console.log('File read Error.');
			resolve(reject);
		})

		stream.on('end', function () { // nodejs에서 Stream은 기본적으로 event emitter이다.
			console.log('ReadStream End.');
			resolve(results);  // Array 반환
		})
	})
}
const file_name = process.argv[2] //list.txt
const dirmd = process.argv[3] // save folder
// fs.mkdir(dirmd)
if (!fs.existsSync(dirmd)) { fs.mkdirSync(dirmd); }

(async () => {
	data = await arrayReadFile(file_name);
	console.log('목록 : ', data);

	browser = await puppeteer.launch();
	browser.on('dialog', async dialog => {
		await dialog.dismiss();
	});

	requestList = arryslice(data, 8)
	console.time('as')
	for (let index = 0; index < requestList.length; index++) {

		try {
			await Promise.all(requestList[index].map(async (index) => {
				await screenshot(index)
			}))
			console.timeLog('as')
		} catch (error) {
			console.log(error)
			continue
		}

	}
	console.timeEnd('as')
	console.log('종료')
	browser.close()

})();

async function screenshot(index) {
	const page = await browser.newPage();

	const element = data[index];
	fileN = element.split('menuNo=')[1]

	const regex = /[?.:/]/gi;
	if(typeof fileN=='undefined') fileN=element.replace(regex, '_')

	console.log(fileN)
	
	// takeScreenshot(element)

	// 3. Navigate to URL
	await page.setViewport({ width: 320, height: 480 });
	// console.log(urls)
	await page.goto(element);
	// Get the "viewport" of the page, as reported by the page.
	let dimensions = await page.evaluate(() => {
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
	
	await page.screenshot({
		path: dirmd + `/${fileN}-${index}-320.png`,
		type: "png"
	});

	await page.setViewport({ width: 750, height: 1200 });
	dimensions = await page.evaluate(() => {
		return {
			width: 750,
			height: document.documentElement.scrollHeight,
			deviceScaleFactor: window.devicePixelRatio
		};
	});
	await page.setViewport(dimensions);
	await page.screenshot({
		path: dirmd + `/${fileN}-${index}-768.png`,
		type: "png"
	});
	await page.screenshot({
		path: dirmd + `/${fileN}-${index}-full.png`,
		fullPage: true
	});
	await page.close();

}

function arryslice(list, size) {
	newlist = []
	temp = []
	index = 0
	for (const key in list) {
		index++
		temp.push(key)
		if (index % size == 0) {
			newlist.push(temp)
			temp = []
		}
	}
	newlist.push(temp)
	console.log(newlist)
	return newlist
}