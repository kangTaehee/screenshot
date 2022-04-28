const saveurl = './test/';
const file_name = 'list2.txt';
const s320 = true;
const s768 = false;
const s1200 = true;
const htmlValidation = true;
const cssValidation = true;
const puppeteer = require('puppeteer');
const fs = require('fs');
var remaining = '';
var urls = [];
const es = require('event-stream');
fs.mkdir(saveurl, { recursive: true }, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log('New directory successfully created.');
	}
});
const arrayToChunks = (array, CHUNKSIZE) => {
	const results = [];
	let start = 0;
	while (start < array.length) {
		results.push(array.slice(start, start + CHUNKSIZE));
		start += CHUNKSIZE;
	}
	return results;
};
function getFileContents(fileName) {
	const results = [];
	const stream = fs
		.createReadStream(fileName)
		.pipe(es.split()) // default : \n으로 스플릿
		.pipe(
			es.map(function (line, cb) {
				results.push(line);
				//todo : do something with the line
				cb(null, line);
			})
		);
	return new Promise((resolve, reject) => {
		stream.on('error', function (err) {
			console.log('File read Error.');
			resolve(reject);
		});
		stream.on('end', function () {
			// nodejs에서 Stream은 기본적으로 event emitter이다.
			console.log('ReadStream End.');
			resolve(results); // Array 반환
		});
	});
}
const getProductsUrls = async (color) => {
	const browser = await puppeteer.launch();
	let detailLinks;
	let fileN = color.split('&')
	fileN = fileN[fileN.length - 1]
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 320, height: 480 });
		if (s320 || s768 || s1200) {
			await page.goto(color);
		}
		// await page.goto(color);
		if (s320 == true) {
			// console.log(urls)
			const dimensions = await page.evaluate(() => {
				return {
					width: 360,
					height: document.documentElement.scrollHeight,
					deviceScaleFactor: window.devicePixelRatio,
				};
			});
			// console.log(dimensions)
			console.log(fileN)
			await page.setViewport(dimensions);
			await page.screenshot({
				// path: `${saveurl}${fileN}-320.png`,
				path: `${saveurl}${fileN}-320.png`,
				type: 'png',
			});

		}
		// detailLinks = await page.$$eval(
		// 	".a-product-image.item-imgwrap > a",
		// 	(aTags) => aTags.map((a) => a.href),
		// );
	} catch (err) {
		console.log(err);
	} finally {
		await browser.close();
	}
};
(async () => {
	// list3.txt  = url 목록
	const data = await getFileContents(file_name);
	const links = [];
	const CHUNKSIZE = 9;
	const datalist = arrayToChunks(data, CHUNKSIZE);
	console.log(datalist)
	// console.log('목록 : ', data);
	// const browser = await puppeteer.launch();
	// const page = await browser.newPage();
	for (index of datalist) {
		const colorsPromises = index.map((color) => getProductsUrls(color));
		await Promise.all(colorsPromises);
		// const element = data[index];
		// console.log('star => ', element);
		// takeScreenshot(element)
		// fileN = element.split('&savename=')[1];
		// Get the "viewport" of the page, as reported by the page.
		// await page.setViewport({ width: 320, height: 480 });
		// 3. Navigate to URL
		// await page.setViewport ({width : 320, height : 480});
		// await page.waitForNavigation({waitUntil: 'networkidle2'});
		// console.log(index);
		// await console.log('filepathname :     ',filepathname)
	}
	// await browser.close();
})();
