'use strict';
var extendedCalendarModule = (function () {
    var _weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        _refreshQueue = [],
        api = {},
        ONE_HOUR = 3600000,
        ONE_SECOND = 1000,
        ONE_MINUTE = 60000,
        MIN_MINUTES = 5,
        MAX_MINUTES = 50,
        DAYS_IN_WEEK = 7;
    var _currentWeekDates = function (date) {
        var array = [],
            temp = new Date(date);
        for (var i = 1; i <= DAYS_IN_WEEK; i++) {
            array.push(new Date(temp.setDate(temp.getDate() - temp.getDay() + i)));
        }
        return array;
    };
    var _selectedDates = function (days, dates, time) {
        var array = [];
        for (var i = 0; i < days.length; i++) {
            for (var j = 0; j < _weekDays.length; j++) {
                if (days[i] == _weekDays[j]) {
                    array.push(new Date(dates[j].toJSON().slice(0, 10) + " " + time));
                }
            }
        }
        return array;
    };
    var _repeatByDays = function repeatByDays(days, time, event) {
        var curr = new Date(),
            refresh = 0,
            currentDates,
            selectedDays;
        currentDates = _currentWeekDates(curr);
        selectedDays = _selectedDates(days, currentDates, time);
        if (selectedDays.length > 0) {
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
        } else {
            console.log("Such days not found!");
        }
        if (refresh > 0) {
            setTimeout(function () {
                console.log(event.name + " | " + event.about);
                _refreshQueue = [];
                repeatByDays(days, time, event);
            }, refresh);
        }
    };
    var _repeatEveyDay = function repeatEveyDay(time, event) {
        var refresh = 0,
            date = new Date(),
            tomorrow = new Date(),
            eventHour = +time.slice(0, 2),
            eventMinute = +time.slice(3, 5),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            hourDifferent = (hours > eventHour) ? -(hours - eventHour) : eventHour - hours,
            minutesDifferent = hourDifferent == 1 ? eventMinute + (60 - (minutes)) : eventMinute - minutes;
        if (hours > eventHour) {
            tomorrow.setDate(date.getDate() + 1);
            tomorrow.setHours(eventHour, eventMinute, 0);
            refresh = tomorrow - date.getTime();
        } else if (hours == eventHour && minutes + 1 > eventMinute) {
            tomorrow.setDate(date.getDate() + 1);
            tomorrow.setHours(eventHour, eventMinute, 0);
            refresh = tomorrow - date.getTime();
        } else {
            if (hourDifferent == 1) {
                refresh = date.getTime() + (minutesDifferent * ONE_MINUTE) - (seconds * ONE_SECOND);
                refresh = refresh - date.getTime();
            } else {
                refresh = date.getTime() + (hourDifferent * ONE_HOUR) + (minutesDifferent * ONE_MINUTE) - (seconds * ONE_SECOND);
                refresh = refresh - date.getTime();
            }
        }
        if (refresh > 0) {
            setTimeout(function () {
                console.log(event.name + " | " + event.about);
                repeatEveyDay(time, event);
            }, refresh);
        }
    };
    var _beforeEvent = function (event, time, callback) {
        var refresh = 0,
            current = new Date();
        if (event.pending) {
            refresh = (event.startDate.getTime() - (time * ONE_MINUTE)) - current.getTime();
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
            console.log(errorMsg);
            return false;
        }
        return true;
    };
    var _validateMinutes = function (minutes) {
        var errorMsg = "",
            regs = "",
            re = /^(\d{1,2})$/;
        if (minutes !== '') {
            if (minutes.match(re)) {
                regs = minutes.match(re);
                if (regs[1] < MIN_MINUTES || regs[1] > MAX_MINUTES) {
                    errorMsg = "Invalid value for minutes: " + regs[1] + " - must be between '5' and '50'";
                }
            } else {
                errorMsg = "Invalid minutes format: " + minutes;
            }
        } else {
            errorMsg = "Empty minutes not allowed!";
        }
        if (errorMsg !== "") {
            console.log(errorMsg);
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
    api.remindBeforeEvent = function (event, time, callback) {
        if (_validateMinutes(time)) {
            _beforeEvent(event, time, callback);
        }
    };
    api.remindBeforeAllEvents = function (events, time, callback) {
        if (_validateMinutes(time)) {
            _beforeAllEvents(events, time, callback);
        }
    };
    return api;
})();