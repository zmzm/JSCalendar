'use strict';
var calendarModule = (function (api) {
    var events = [],
        id = 0;
    var _getEventsInRange = function (start, end) {
        var eventsInRange = [];
        for (var i = 0; i < events.length; i++) {
            if (Date.parse(events[i].startDate) >= Date.parse(start) && Date.parse(events[i].startDate) <= Date.parse(end)) {
                eventsInRange.push(events[i]);
            }
        }
        return eventsInRange;
    };
    var _eventReminder = function (date, event) {
        var refresh = 0,
            current = new Date();
        if (event.pending) {
            refresh = date.getTime() - current.getTime();
            if (refresh > 0) {
                setTimeout(function () {
                    event.pending = false;
                    console.log(event.name + " | " + event.about);
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
            console.log(errorMsg);
            return false;
        }
        return true;
    };
    var _validateDate = function (date) {
        var currentYear = (new Date()).getFullYear(),
            errorMsg = "",
            regs = [],
            re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (date !== '') {
            if (date.match(re)) {
                regs = date.match(re);
                if (regs[1] < 1 || regs[1] > 12) {
                    errorMsg += "Invalid value for month: " + regs[2] + "\n";
                }
                if (regs[2] < 1 || regs[2] > 31) {
                    errorMsg += "Invalid value for day: " + regs[1] + "\n";
                }
                if (regs[3] != currentYear) {
                    errorMsg += "Invalid value for year.";
                }
            } else {
                errorMsg = "Invalid date format: " + date;
            }
        } else {
            errorMsg = "Empty date not allowed!";
        }
        if (errorMsg !== "") {
            console.log(errorMsg);
            return false;
        }
        return true;
    };
    api.getAllEvents = function () {
        return events;
    };
    api.getEventsByDay = function () {
        var curr = new Date(),
            eventsByDate = [];
        for (var i = 0; i < events.length; i++) {
            if (events[i].startDate.toDateString() == curr.toDateString()) {
                eventsByDate.push(event);
            }
        }
        return eventsByDate;
    };
    api.getEventsByWeek = function () {
        var curr = new Date(),
            weekEvents,
            firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)).toJSON().slice(0, 10),
            lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)).toJSON().slice(0, 10);
        weekEvents = _getEventsInRange(firstDay, lastDay);
        return weekEvents;
    };
    api.getEventsInPeriod = function (start, end) {
        return _getEventsInRange(start, end);
    };
    api.addEvent = function (name, time, about, date) {
        var event = {};
        if (_validateTime(time) && _validateDate(date)) {
            event = {
                id: ++id,
                name: name,
                startDate: new Date(date + " " + time) || "",
                time: time,
                pending: true,
                remindBefore: true,
                about: about || ""
            };
            events.push(event);
            _eventReminder(event.startDate, event);
        }
        return event;
    };
    api.getEventsByMonth = function () {
        var date = new Date(),
            monthEvents,
            firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toJSON().slice(0, 10),
            lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toJSON().slice(0, 10);
        monthEvents = _getEventsInRange(firstDay, lastDay);
        return monthEvents;
    };
    api.deleteEvent = function (event) {
        for (var i = 0; i < events.length; i++) {
            if (events[i] === event) {
                events.splice(i, 1);
            }
        }
    };
    api.deleteEventByName = function (eventName) {
        for (var i = 0; i < events.length; i++) {
            if (events[i].name === eventName) {
                events.splice(i, 1);
            }
        }
    };
    api.editEvent = function (event) {
        for (var i = 0; i < events.length; i++) {
            if (events[i].id === event.id) {
                events[i] = event;
                return event;
            }
        }
    };
    return api;
})(extendedCalendarModule || {});