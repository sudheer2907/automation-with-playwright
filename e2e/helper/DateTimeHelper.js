/**
 * DateTimeHelper - Utility methods for date and time operations in Playwright tests
 * Provides reusable date/time functions for test data generation and date validations
 */

exports.DateTimeHelper = class DateTimeHelper {

  /**
   * Get current date and time in various formats
   * @returns {Object} Object with different date/time formats
   */
  static getCurrentDateAndTime() {
    const now = new Date();
    return {
      full: now,
      iso: now.toISOString(),
      isoDate: now.toISOString().split('T')[0], // YYYY-MM-DD
      time: now.toTimeString().split(' ')[0], // HH:MM:SS
      dateString: now.toDateString(), // Thu Jan 01 2024
      localeString: now.toLocaleString('en-US'),
      localeDate: now.toLocaleDateString('en-US'),
      localeTime: now.toLocaleTimeString('en-US'),
      timestamp: now.getTime(),
      unix: Math.floor(now.getTime() / 1000),
    };
  }

  /**
   * Get date components (year, month, day, hour, minute, second)
   * @returns {Object} Object with individual date components
   */
  static getDateComponents() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // 1-12
      monthName: now.toLocaleString('en-US', { month: 'long' }),
      monthShort: now.toLocaleString('en-US', { month: 'short' }),
      day: now.getDate(),
      dayOfWeek: now.getDay(), // 0-6
      dayName: now.toLocaleString('en-US', { weekday: 'long' }),
      dayNameShort: now.toLocaleString('en-US', { weekday: 'short' }),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      millisecond: now.getMilliseconds(),
    };
  }

  /**
   * Get first date of the current month
   * @returns {Date} First date of current month
   */
  static getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Get first date of a specific month
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (1-12)
   * @returns {Date} First date of specified month
   */
  static getFirstDateOfSpecificMonth(year, month) {
    return new Date(year, month - 1, 1);
  }

  /**
   * Get last date of the current month
   * @returns {Date} Last date of current month
   */
  static getLastDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  /**
   * Get last date of a specific month
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (1-12)
   * @returns {Date} Last date of specified month
   */
  static getLastDateOfSpecificMonth(year, month) {
    return new Date(year, month, 0);
  }

  /**
   * Add days to a given date
   * @param {Date|null} date - Date to add days to (defaults to today)
   * @param {number} days - Number of days to add (can be negative)
   * @returns {Date} New date with added days
   */
  static addDays(date = null, days) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate;
  }

  /**
   * Get date N days from today
   * @param {number} days - Number of days (positive = future, negative = past)
   * @returns {Object} Object with date in multiple formats
   */
  static getDateFromToday(days) {
    const futureDate = this.addDays(null, days);
    return {
      full: futureDate,
      iso: futureDate.toISOString(),
      isoDate: futureDate.toISOString().split('T')[0],
      dateString: futureDate.toDateString(),
      timestamp: futureDate.getTime(),
    };
  }

  /**
   * Add months to a date
   * @param {Date|null} date - Date to add months to (defaults to today)
   * @param {number} months - Number of months to add (can be negative)
   * @returns {Date} New date with added months
   */
  static addMonths(date = null, months) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    return targetDate;
  }

  /**
   * Add years to a date
   * @param {Date|null} date - Date to add years to (defaults to today)
   * @param {number} years - Number of years to add (can be negative)
   * @returns {Date} New date with added years
   */
  static addYears(date = null, years) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setFullYear(targetDate.getFullYear() + years);
    return targetDate;
  }

  /**
   * Format date as MM/DD/YYYY
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDateMMDDYYYY(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Format date as DD/MM/YYYY
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDateDDMMYYYY(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDateYYYYMMDD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format time as HH:MM:SS
   * @param {Date} date - Date to format time from
   * @returns {string} Formatted time string
   */
  static formatTimeHHMMSS(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format time as HH:MM
   * @param {Date} date - Date to format time from
   * @returns {string} Formatted time string
   */
  static formatTimeHHMM(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Check if date is today
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is today
   */
  static isToday(date) {
    const checkDate = new Date(date);
    const today = new Date();
    return checkDate.getDate() === today.getDate() &&
           checkDate.getMonth() === today.getMonth() &&
           checkDate.getFullYear() === today.getFullYear();
  }

  /**
   * Check if date is in the past
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is in the past
   */
  static isPast(date) {
    return new Date(date) < new Date();
  }

  /**
   * Check if date is in the future
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is in the future
   */
  static isFuture(date) {
    return new Date(date) > new Date();
  }

  /**
   * Get difference between two dates in days
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {number} Number of days between dates
   */
  static getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDiff = Math.abs(d2 - d1);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference between two dates in hours
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {number} Number of hours between dates
   */
  static getHoursDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDiff = Math.abs(d2 - d1);
    return Math.ceil(timeDiff / (1000 * 60 * 60));
  }

  /**
   * Parse date string to Date object
   * @param {string} dateString - Date string (ISO, MM/DD/YYYY, DD/MM/YYYY, etc.)
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Get array of dates for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array<Date>} Array of dates between start and end (inclusive)
   */
  static getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Check if a year is a leap year
   * @param {number} year - Year to check
   * @returns {boolean} True if leap year
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Get number of days in a month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {number} Number of days in the month
   */
  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
};
