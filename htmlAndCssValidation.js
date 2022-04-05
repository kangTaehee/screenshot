const saveurl = './scps/';
const urlList = 'scps.txt';
const saveFileNameToCSV = 'scps';
const s320 = false;
const s768 = false;
const s1200 = false;
const htmlValidation = true;
const cssValidation = true;
const puppeteer = require('puppeteer');
const fs = require('fs');
var remaining = '';
var urls = [];
const es = require('event-stream');
var someText = '\uFEFF주소,페이지 제목,html오류,html경고,css오류,css경고\n'
fs.mkdir(saveurl, { recursive: true }, function (err) {
	if (err) {
		console.log('err = ',err);
	} else {
		console.log('New directory successfully created.');
	}
});
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
			console.log('4','File read Error.');
			resolve(reject);
		});
		stream.on('end', function () {
			// nodejs에서 Stream은 기본적으로 event emitter이다.
			console.log('5','ReadStream End.');
			resolve(results); // Array 반환
		});
	});
}
(async () => {
	// list3.txt  = url 목록
	const data = await getFileContents(urlList);
	console.log('6','목록 : ', data);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		console.log('7','star => ', element);
		// takeScreenshot(element)
		fileN = element.split('&savename=')[1];
		if (typeof fileN == 'undefined')
			fileN = element.split('menuNo=')[1];
		// console.log('8',fileN);
		if (typeof fileN == 'undefined') {
			fileN = index
		}
		// Get the "viewport" of the page, as reported by the page.
		await page.setViewport({ width: 320, height: 480 });
		// 3. Navigate to URL
		if (s320 || s768 || s1200) {
			await page.goto(element);
		}
		if (s320 == true) {
			// console.log('9',urls)
			const dimensions = await page.evaluate(() => {
				return {
					width: 360,
					height: document.documentElement.scrollHeight,
					deviceScaleFactor: window.devicePixelRatio,
				};
			});
			// console.log('10',dimensions)
			await page.setViewport(dimensions);
			await page.screenshot({
				path: `${saveurl}${fileN}${index}-320.png`,
				type: 'png',
			});
		}
		if (s768 == true) {
			await page.setViewport({ width: 768, height: 768 });
			const dimensions2 = await page.evaluate(() => {
				return {
					width: 768,
					height: document.documentElement.scrollHeight,
					deviceScaleFactor: window.devicePixelRatio,
				};
			});
			console.log('13',dimensions2);
			await page.setViewport(dimensions2);
			await page.screenshot({
				path: `${saveurl}${fileN}${index}-768.png`,
				type: 'png',
			});
		}
		if (s1200 == true) {
			// 4. Take screenshot
			await page.setViewport({ width: 1240, height: 1500 });
			await page.screenshot({
				path: `${saveurl}${fileN}-full.png`,
				// ,fullPage: true
			});
		}
		if (htmlValidation == true) {
			await page.goto(element)
			await page.waitForSelector('title')
			let el = await page.$('title')
			someText += element + ','
			pateTitle = await page.evaluate(el => el.textContent, el)
			pateTitle = pateTitle.trim()
			pateTitle = pateTitle.replace(/\n/g, ' ');
			pateTitle = pateTitle.replace(/\s+/g, ' ');
			someText += pateTitle + ','
			console.log('pateTitle = ',pateTitle)
			await page.goto('https://html5.validator.nu/?doc=' + element);
			// 4. Take screenshot
			await page.setViewport({ width: 800, height: 540 });
			const error = (await page.$$('.error')).length;
			const warning = (await page.$$('.warning')).length;
			someText += error + ','
			someText += warning + ','
			await page.screenshot({
				path: `${saveurl}${fileN}-html_err=${error}_warning=${warning}.png`,
				// ,fullPage: true
			});
		}
		if (cssValidation == true) {
			await page.goto('https://jigsaw.w3.org/css-validator/validator?uri=' + element);
			// https://validator.w3.org/nu/?doc=http://112.220.85.26:8175/kdhc/main/main.do
			const error = (await page.$$('.error')).length;
			const warning = (await page.$$('.warning')).length;
			someText += error + ','
			someText += warning + '\n'
			// 4. Take screenshot
			await page.setViewport({ width: 800, height: 610 });
			await page.screenshot({
				path: `${saveurl}${fileN}-css.png`,
				// ,fullPage: true
			});
		}
		try {
			fs.writeFileSync(`${saveFileNameToCSV}.csv`, someText, 'utf8')
			//file written successfully
		} catch (err) {
			console.error(err)
		}
	}
	await browser.close();
})();
