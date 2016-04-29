'use strict';
var extendedCalendarModule = (function (api) {
	var _weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	var _refreshQueue = [];
	var _currentWeekDates = function (date) {
		var array = [],
		firstday = new Date(date.setDate(date.getDate() - date.getDay() + 1)),
		temp = new Date(firstday);
		array.push(firstday);
		for (var i = 2; i < 8; i++) {
			array.push(new Date(temp.setDate(temp.getDate() - temp.getDay() + i)));
		}
		return array;
	};
	var _selectedDates = function (days, dates, time) {
		var array = [];
		for (var i = 0; i < days.length; i++) {
			for (var j = 0; j < _weekDays.length; j++) {
				if (days[i] == _weekDays[j]) {
					array.push(Date.parse(dates[j].toDateString() + " " + time));
				}
			}
		}
		return array;
	};
	var _repeatByDays = function repeatByDays(days, time, event) {
		var curr = new Date(),
		tempCurr = new Date(curr),
		refresh = 0,
		currentDates = [],
		selectedDays = [];
		currentDates = _currentWeekDates(tempCurr);
		console.log(currentDates);
		selectedDays = _selectedDates(days, currentDates, time);
		for (var i = 0; i < selectedDays.length; i++) {
			if (curr.getTime() > selectedDays[i].getTime()) {
				refresh = -1;
			} else if (curr.getTime() < selectedDays[i].getTime()) {
				refresh = selectedDays[i].getTime() - curr.getTime();
				_refreshQueue.push(refresh);
			}
		}
		_refreshQueue.sort();
		refresh = Math.min.apply(Math, _refreshQueue);
		if (refresh > 0) {
			setTimeout(function () {
				alert(event.name + " | " + event.about);
				_refreshQueue = [];
				repeatByDays(days, time, event);
			}, refresh);
		}
	};
	var _repeatEveyDay = function repeatEveyDay(time, event) {
		var refresh = 1000,
		date = new Date(),
		eventHour = time.slice(0, 2),
		eventMinute = time.slice(3, 5),
		eventSeconds = 0,
		hours = date.getHours(),
		minutes = date.getMinutes(),
		seconds = date.getSeconds(),
		hourDifferent = (hours > eventHour) ?  - (hours - eventHour) : eventHour - hours,
		millisecondsInOneDay = 3600000,
		hoursInDay = 24,
		millisecondsInSecond = 1000,
		millisecondsInMinute = 60 * 1000;
		minutesDifferent = hourDifferent == 1 ? eventMinute + (60 - (minutes)) : eventMinute - minutes;
		if (event.pending) {
			if (hours > eventHour) {
				refresh = date.getTime() + (hourDifferent * millisecondsInOneDay) + (hoursInDay * millisecondsInOneDay) + (minutesDifferent * millisecondsInMinute) - (seconds * millisecondsInSecond);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			} else if (hours == eventHour && minutes + 1 > eventMinute) {
				refresh = date.getTime() + (hoursInDay * millisecondsInOneDay) + (minutesDifferent * millisecondsInMinute) - (seconds * millisecondsInSecond);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			} else {
				refresh = date.getTime() + ((eventHour - hours) * millisecondsInOneDay) + (minutesDifferent * millisecondsInMinute) - (seconds * millisecondsInSecond);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			}
			if (refresh > 0) {
				setTimeout(function () {
					if (date.getHours() == eventHour && date.getMinutes() == eventMinute && date.getSeconds() == eventSeconds) {
						alert(event.name + " | " + event.about);
					}
					repeatEveyDay(time, event);
				}, refresh);
			}
		}
	};
	var _beforeEvent = function (event, time, callback) {
		var refresh = 1000,
		millisecondsInMinute = 60 * 1000,
		current = new Date();
		event.remindBefore = true;
		if (event.pending) {
			refresh = (event.startDate.getTime() - (time * millisecondsInMinute)) - current.getTime();
			console.log(refresh);
			current = current.getTime() + refresh;
			if (refresh > 0) {
				setTimeout(function () {
					event.remindBefore = false;
					callback();
				}, refresh);
			}
		}
	};
	var _beforeAllEvents = function (events, time, callback) {
		for (var i = 0; i < events.length; i++) {
			_beforeEvent(events[i], time, callback);
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
	api.repeatEventEveryDay = function (time, event) {
		if (_validateTime(time)) {
			_repeatEveyDay(time, event);
		}
		return event;
	};
	api.repeatByDays = function (days, time, event) {
		if (_validateTime(time)) {
			_repeatByDays(days, time, event);
			return event;
		}
	};
	api.remindBefoEvent = function (event, time, callback) {
		if (_validateTime(time)) {
			_beforeEvent(event, time, callback);
		}
	};
	api.remindBeforeAllEvents = function (events, time, callback) {
		if (_validateTime(time)) {
			_beforeAllEvents(events, time, callback);
		}
	};
	return api;
})(extendedCalendarModule || {});