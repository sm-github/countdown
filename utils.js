$ = function (query) {
	if (query[0] === '.')
		return document.getElementsByClassName(query.substr(1));

	if (query[0] === '#')
		return document.getElementById(query.substr(1));

	return document.getElementsByTagName(query);
}

function formatDate (date) {
	return date.toLocaleDateString('en-US', 'month, day');
}

function isArrowKey (key) {
	var ARROW_KEYS = [37, 38, 39, 40];
	return (ARROW_KEYS.indexOf(key.keyCode) > -1);
}

function createElement (name, className, innerHTML) {
	var el = document.createElement(name);
	if (className)
		el.className = className;

	if (innerHTML)
		el.innerHTML = innerHTML

	return el;
}