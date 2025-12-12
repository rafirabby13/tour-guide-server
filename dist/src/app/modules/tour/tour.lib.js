"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeToMinutes = void 0;
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};
exports.timeToMinutes = timeToMinutes;
