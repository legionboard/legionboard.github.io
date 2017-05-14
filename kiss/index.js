// Get parameters
var apiRoot = getURLParameter('api').trim();
var username = getURLParameter('user').trim().toLowerCase();
var password = getURLParameter('pass').trim();
// Generate hash for authentication key
var shaObj = new jsSHA('SHA-256', 'TEXT');
shaObj.update(username + '//' + password);
var hash = shaObj.getHash('HEX');
// Array containing courses
var courses = new Array();
// Array containing teachers
var teachers = new Array();
// Request courses
var requestCourses = new XMLHttpRequest();
requestCourses.open('GET', apiRoot + '/courses?k=' + hash + '&_=' + new Date().getTime(), true);
requestCourses.onload = function() {
	if (this.status === 200) {
		var data = JSON.parse(this.response);
		for (var i = 0; i < data.length; i++) {
			courses[data[i].id] = data[i].name;
		}
		getTeachers();
	}
	else if (this.status === 404) {
		getTeachers();
	}
	else {
		document.body.innerHTML = 'Something went wrong with getting courses. Please try it again later.';
	}
};
requestCourses.onerror = function() {
	document.body.innerHTML = 'Something went wrong with getting courses. Please try it again later.';
};
requestCourses.send();
// Request teachers
function getTeachers() {
	var requestTeachers = new XMLHttpRequest();
	requestTeachers.open('GET', apiRoot + '/teachers?k=' + hash + '&_=' + new Date().getTime(), true);
	requestTeachers.onload = function() {
		if (this.status === 200) {
			var data = JSON.parse(this.response);
			for (var i = 0; i < data.length; i++) {
				teachers[data[i].id] = data[i].name;
			}
			getChanges();
		}
		else if (this.status === 404) {
			getChanges();
		}
		else {
			document.body.innerHTML = 'Something went wrong with getting teachers. Please try it again later.';
		}
	};
	requestTeachers.onerror = function() {
		document.body.innerHTML = 'Something went wrong with getting teachers. Please try it again later.';
	};
	requestTeachers.send();
}
// Request changes
function getChanges() {
	var requestChanges = new XMLHttpRequest();
	requestChanges.open('GET', apiRoot + '/changes?startBy=now&endBy=i1w&k=' + hash + '&_=' + new Date().getTime(), true);
	requestChanges.onload = function() {
		if (this.status === 200) {
			var data = JSON.parse(this.response);
			data.sort(function(a, b) {
				var dateA = new Date(a.startingDate);
				var dateB = new Date(b.startingDate);
				// Sort by date ascending
				return dateA - dateB;
			});
			var output;
			for (var i = 0; i < data.length; i++) {
				// Set teacher
				var teacher = '-';
				if (data[i].teacher !== '0') {
					teacher = teachers[data[i].teacher];
				}
				// Set course
				var course = '-';
				if (data[i].course !== '0' && data[i].course !== null) {
					course = courses[data[i].course];
				}
				// Set starting time
				var startingTime = data[i].startingDate;
				if (data[i].startingHour !== '') {
					startingTime += ' <b>|</b> ' + data[i].startingHour;
				}
				// Set ending time
				var endingTime = data[i].endingDate;
				if (data[i].endingHour !== '') {
					endingTime += ' <b>|</b> ' + data[i].endingHour;
				}
				// Set type
				var type;
				switch (data[i].type) {
					case '0':
						type = 'Cancellation';
						break;
					case '1':
						type = 'Cover';
						break;
					case '2':
						type = 'Information';
						break;
					default:
						type = 'Someone hijacked the server!'
				}
				// Set text
				var text = '-';
				if (data[i].text !== '') {
					text = data[i].text;
				}
				// Set covering teacher
				var coveringTeacher = '-';
				if (data[i].coveringTeacher !== '0') {
					coveringTeacher = teachers[data[i].coveringTeacher];
				}
				output = ((output != null) ? output : '') +
					'<b>' + teacher + '</b>' + '<br />' +
					'<b>' + course + '</b>' + '<br />' +
					startingTime + '<br />' +
					endingTime + '<br />' +
					type + '<br />' +
					text + '<br />' +
					coveringTeacher + '<br />' +
					'<p>-/-</p>';
			}
			output +=
				'&copy; 2016 <a href="https://altnico.github.io">Nico Alt</a><br />' + 
				'<a href="https://gitlab.com/legionboard/kiss" target="_blank">LegionBoard KISS</a> Version <a class="version" href="https://gitlab.com/legionboard/kiss/tags" target="_blank">0.2.1</a>'
			document.body.innerHTML = output;
		}
		else if (this.status === 404) {
			document.body.innerHTML = 'Seems like there are no changes.';
		}
		else {
			document.body.innerHTML = 'Something went wrong with getting changes. Please try it again later.';
		}
	};
	requestChanges.onerror = function() {
		document.body.innerHTML = 'Something went wrong with getting changes. Please try it again later.';
	};
	requestChanges.send();
}
function getURLParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1));
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}
