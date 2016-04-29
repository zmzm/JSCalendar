'use strict';
var calendarModule = (function (api) {
	var events = [],
	eventsByDate = [];
	localStorage.setItem("ID", 0);
	var _monthByNumber = function (monthNumber) {
		var months = new Array(12);
		months[0] = "January";
		months[1] = "February";
		months[2] = "March";
		months[3] = "April";
		months[4] = "May";
		months[5] = "June";
		months[6] = "July";
		months[7] = "August";
		months[8] = "September";
		months[9] = "October";
		months[10] = "November";
		months[11] = "December";
		return months[monthNumber];
	};
	var _daysCountInMonth = function (month) {
		var days = new Array(12);
		days[0] = 31;
		days[1] = 29;
		days[2] = 31;
		days[3] = 30;
		days[4] = 31;
		days[5] = 30;
		days[6] = 31;
		days[7] = 31;
		days[8] = 30;
		days[9] = 31;
		days[10] = 30;
		days[11] = 31;
		return days[month];
	};
	var _weekDays = function () {
		var weekDay = new Array(7);
		weekDay[0] = "Monday";
		weekDay[1] = "Tuesday";
		weekDay[2] = "Wednesday";
		weekDay[3] = "Thursday";
		weekDay[4] = "Friday";
		weekDay[5] = "Saturday";
		weekDay[6] = "Sunday";
		return weekDay;
	};
	var _drawCalendar = function (firstDay, daysCount, currentDate, month, year) {
		var calendar = "",
		daysOfWeek = _weekDays(),
		rowCount = Math.ceil((daysCount + firstDay - 1) / 7),
		columnCount = 7,
		day = 1,
		currentCell = 1;
		calendar += '<table border=2px cellspacing=4 style="border-radius: 8px;">';
		calendar += '<th colspan=7>' + month + " " + year + '</th>';
		calendar += '<tr>';
		for (var i = 0; i < daysOfWeek.length; i++) {
			calendar += '<td width=70 height=30>' + daysOfWeek[i] + '</td>';
		}
		calendar += '</tr>';
		for (var x = 1; x <= rowCount; x++) {
			calendar += '<tr>';
			for (var j = 1; j <= columnCount; j++) {
				if (day > daysCount) {
					calendar += '<td></td>';
				} else if (currentCell < firstDay) {
					calendar += '<td></td>';
					currentCell++;
				} else {
					if (day == currentDate) {
						calendar += '<td height=50 align="right" style="background:grey; vertical-align: top;">' + day + '</td>';
						++day;
					} else {
						calendar += '<td height=50 align="right" style="vertical-align: top;">' + day + '</td>';
						++day;
					}
				}
			}
			calendar += '</tr>';
		}
		calendar += '</table>';
		document.getElementById('calendar').innerHTML = calendar;
	};
	var _drawEventsTable = function (data, msg) {
		var events = "";
		events += '<table border=2px cellspacing=4>';
		events += '<th>' + msg + '</th>';
		if (data.length !== 0) {
			for (var i = 0; i < data.length; i++) {
				events += '<tr>';
				events += '<td height=50>' + data[i].name + " --- " + data[i].startDate.toJSON().slice(0, 10) + '</td>';
				events += '</tr>';
			}
		} else {
			events += '<tr><td height=50>No events.</td></tr>';
		}
		events += '</table>';
		document.getElementById('events_container').innerHTML = events;
	};
	var _getEventsInRange = function (start, end) {
		var eventsInRange = [];
		$.map(events, function (event) {
			if (Date.parse(event.startDate) >= Date.parse(start) && Date.parse(event.startDate) <= Date.parse(end)) {
				eventsInRange.push(event);
			}
		});
		return eventsInRange;
	};
	var _eventReminder = function (date, event) {
		var refresh = 0;
		var current = new Date();
		if (event.pending) {
			date = new Date(date);
			refresh = date.getTime() - current.getTime();
			console.log(refresh);
			current = current.getTime() + refresh;
			if (refresh > 0) {
				setTimeout(function () {
					if ((current >= date.getTime())) {
						event.pending = false;
						alert(event.name + " | " + event.about);
					}
				}, refresh);
			} else {
				event.pending = false;
			}
		}
	};
	var _validateTime = function (time) {
		var errorMsg = "",
		regs = "",
		re = /^(\d{1,2}):(\d{2})$/;
		if (time !== '') {
			if (time.match(re)) {
				regs = time.match(re);
				if (regs[1] > 23 || regs[1] < 0) {
					errorMsg = "Invalid value for hours: " + regs[1] + "\n";
				}
				if (regs[2] > 59 || regs[2] < 0) {
					errorMsg += "Invalid value for minutes: " + regs[2];
				}
			} else {
				errorMsg = "Invalid time format: " + time;
			}
		} else {
			errorMsg = "Empty time not allowed!";
		}
		if (errorMsg !== "") {
			alert(errorMsg);
			return false;
		}
		return true;
	};
	var _validateDate = function (date) {
		var minYear = 2000,
		maxYear = (new Date()).getFullYear(),
		errorMsg = "",
		regs = [],
		re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
		if (date !== '') {
			if (date.match(re)) {
				regs = date.match(re);
				if (regs[1] < 1 || regs[1] > 31) {
					errorMsg += "Invalid value for day: " + regs[1] + "\n";
				}
				if (regs[2] < 1 || regs[2] > 12) {
					errorMsg += "Invalid value for month: " + regs[2] + "\n";
				}
				if (regs[3] < minYear || regs[3] > maxYear) {
					errorMsg += "Invalid value for year: " + regs[3] + " - must be between " + minYear + " and " + maxYear;
				}
			} else {
				errorMsg = "Invalid date format: " + date;
			}
		} else {
			errorMsg = "Empty date not allowed!";
		}
		if (errorMsg !== "") {
			alert(errorMsg);
			return false;
		}
		return true;
	};
	api.getAllEvents = function () {
		return events;
	};
	api.init = function () {
		var now = new Date(),
		year = now.getFullYear(),
		month = now.getMonth(),
		currentDate = now.getDate(),
		firstDay = new Date(year, month, 1).getDay(),
		daysCount = _daysCountInMonth(month);
		_drawCalendar(firstDay, daysCount, currentDate, _monthByNumber(month), year);
	};
	api.getEventsByDay = function () {
		var curr = new Date();
		eventsByDate = [];
		$.map(events, function (event) {
			if (event.startDate.toDateString() == curr.toDateString()) {
				eventsByDate.push(event);
			}
		});
		_drawEventsTable(eventsByDate, "Events of the day");
		return eventsByDate;
	};
	api.getEventsByWeek = function () {
		var curr = new Date(),
		weekEvents = [],
		firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toJSON().slice(0, 10),
		lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).toJSON().slice(0, 10);
		weekEvents = _getEventsInRange(firstday, lastday);
		_drawEventsTable(weekEvents, "Events for the week");
		return weekEvents;
	};
	api.getEventsInPeriod = function (start, end) {
		return _getEventsInRange(start, end);
	};
	api.addEvent = function (name, time, about, date) {
		var event = {},
		localId = localStorage.getItem("ID");
		if (_validateTime(time) && _validateDate(date)) {
			localStorage.setItem("ID", ++localId);
			event = {
				id : localStorage.getItem("ID"),
				name : name,
				startDate : Date.parse(date + " " + time) || "",
				time : time,
				pending : true,
				remindBefore : false,
				about : about || ""
			};
			events.push(event);
			_eventReminder(event.startDate, event);
		}
		return event;
	};
	api.getEventsByMonth = function () {
		var date = new Date(),
		monthEvents = [],
		firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toJSON().slice(0, 10),
		lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toJSON().slice(0, 10);
		monthEvents = _getEventsInRange(firstDay, lastDay);
		_drawEventsTable(monthEvents, "Events for the month");
		return monthEvents;
	};
	api.deleteEvent = function (event) {
		$.each(events, function (i) {
			if (events[i] === event) {
				events.splice(i, 1);
			}
		});
	};
	api.deleteEventByName = function (eventName) {
		$.each(events, function (i) {
			if (events[i].name === eventName) {
				events.splice(i, 1);
			}
		});
	};
	api.editEvent = function (event) {
		$.each(events, function (i) {
			if (events[i].id === event.id) {
				events[i] = event;
			}
		});
	};
	return api;
})(extendedCalendarModule || {});