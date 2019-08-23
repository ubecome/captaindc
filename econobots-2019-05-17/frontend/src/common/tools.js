const download = (url, fileName) =>
{
	const link = document.createElement('a');
	link.href = url;
	link.target = '_blank';
	link.download = fileName;

	document.body.appendChild(link);
	link.click();

	setTimeout(() =>
	{
		document.body.removeChild(link);

		if(url.startsWith('blob:'))
		{
			window.URL.revokeObjectURL(url);
		}
	}, 100);
};

const screenshot = (base64Jpeg, fileName) =>
{
	fetch(base64Jpeg).then(res => res.blob()).then(blob =>
	{
		download(URL.createObjectURL(blob), fileName);
	});
};

const blobURLfromURL = (url, cb) =>
{
	if(cb)
	{
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.onload = () =>
		{
			if(xhr.readyState === 4)
			{
				cb(xhr.status === 200 ? URL.createObjectURL(xhr.response) : undefined);
			}
		};

		xhr.send();
	}
};

const secToMinSec = (sec) =>
{
	let m = Math.floor(sec / 60);
	if(m < 10)
	{
		m = '0' + m;
	}

	let s = sec % 60;
	if(s < 10)
	{
		s = '0' + s;
	}

	return m + ':' + s;
}

export default {screenshot, download, blobURLfromURL, secToMinSec};
