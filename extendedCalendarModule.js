'use strict';
var extendedCalendarModule = (function (api) {
	var _weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	var _refreshQueue = [];
	var _repeatByDays = function repeatByDays(days, time, event) {
		var curr = new Date(),
		tempCurr = new Date(curr),
		currentDates = [],
		selectedDays = [],
		firstday = new Date(tempCurr.setDate(tempCurr.getDate() - tempCurr.getDay() + 1)),
		temp = new Date(firstday);
		currentDates.push(firstday);
		for (var i = 2; i < 8; i++) {
			currentDates.push(new Date(temp.setDate(temp.getDate() - temp.getDay() + i)));
		}
		for (var i = 0; i < days.length; i++) {
			for (var j = 0; j < _weekDays.length; j++) {
				if (days[i] == _weekDays[j]) {
					selectedDays.push(Date.parse(currentDates[j].toDateString() + " " + time));
				}
			}
		}
		var refresh = 0;
		for (var i = 0; i < selectedDays.length; i++) {
			if (curr.getTime() > selectedDays[i].getTime()) {
				refresh = -1;
			} else if (curr.getTime() < selectedDays[i].getTime()) {
				refresh = selectedDays[i].getTime() - curr.getTime();
				_refreshQueue.push(refresh);
				//console.log(new Date(selectedDays[i].getTime() - curr.getTime() + curr.getTime()) + " " + refresh);
			}
		}
		_refreshQueue.sort();
		//console.log(_refreshQueue);
		refresh = Math.min.apply(Math, _refreshQueue);
		if (refresh > 0) {
			//console.log(refresh);
			setTimeout(function () {
				alert(event.name + " | " + event.about);
				_refreshQueue = [];
				repeatByDays(days, time, event);
			}, refresh);
		}
	};
	var _repeatEveyDay = function (time, event) {
		var refresh = 1000,
		eventHour = time.slice(0, 2),
		eventMinute = time.slice(3, 5),
		eventSeconds = 0;
		if (event.pending) {
			var date = new Date(),
			hours = date.getHours(),
			minutes = date.getMinutes(),
			seconds = date.getSeconds(),
			hourDifferent = (hours > eventHour) ?  - (hours - eventHour) : eventHour - hours,
			minutesDifferent = hourDifferent == 1 ? eventMinute + (60 - (minutes)) : eventMinute - minutes;
			if (hours > eventHour) {
				refresh = date.getTime() + (hourDifferent * 3600000) + (24 * 3600000) + (minutesDifferent * 60 * 1000) - (seconds * 1000);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			} else if (hours == eventHour && minutes + 1 > eventMinute) {
				refresh = date.getTime() + (24 * 3600000) + (minutesDifferent * 60 * 1000) - (seconds * 1000);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			} else {
				refresh = date.getTime() + ((eventHour - hours) * 3600000) + (minutesDifferent * 60 * 1000) - (seconds * 1000);
				refresh = refresh - date.getTime();
				date = new Date(date.getTime() + refresh);
			}
			if (refresh > 0) {
				setTimeout(function () {
					if (date.getHours() == eventHour && date.getMinutes() == eventMinute && date.getSeconds() == eventSeconds) {
						alert(event.name + " | " + event.about);
					}
					_repeatEveyDay(eventHour + ":" + eventMinute, event);
				}, refresh);
			}
		}
	};
	var _beforeEvent = function (event, time, callback) {
		var refresh = 1000;
		event.remindBefore = true;
		if (event.pending) {
			var current = new Date();
			refresh = (event.startDate.getTime() - (time * 60 * 1000)) - current.getTime();
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
	api.repeatEventEveryDay = function (time, event) {
		_repeatEveyDay(time, event);
		return event;
	};
	api.repeatByDays = function (days, time, event) {
		_repeatByDays(days, time, event);
		return event;
	};
	api.remindBefoEvent = function (event, time, callback) {
		_beforeEvent(event, time, callback);
	};
	api.remindBeforeAllEvents = function (events, time, callback) {
		_beforeAllEvents(events, time, callback);
	};
	return api;
})(extendedCalendarModule || {});