
/**
 * Provides a software based running clock for the time and date for the arcade.
 * The makecode arcade doesn't have a true real-time clock. The arcade uses a timer derived from the
 * 16MHz clock, which is crystal based and should have an accuracy near 10 part per million,
 * or about 0.864 seconds/day.
 *
 * @cradit Bill Siever
 */
//% block="Time and Date"
//% color="#AA278D"  icon="\uf017"
namespace TimeAndDate {

    export class dates { constructor(public month: number, public day: number, public year: number) { } }

    //% blockId=datetime_dateshadow
    //% block="month $month / day $day / year $year" advanced=true
    //% month.min=1 month.max=12 month.defl=1
    //% day.min=1 day.max=31 day.defl=20
    //% year.min=2020 year.max=2050 year.defl=2022
    //% group="class one"
    //% weight=19
    export function datev(month: number, day: number, year: number) { return new dates(((month-1)%12)+1, ((day-1)%31)+1, year) }

    export class times { constructor(public hour: number, public minute: number, public second: number) { } }

    //% blockId=datetime_timeshadow
    //% block="$hour : $min . $sec" advanced=true
    //% hour.min=0 hour.max=23 hour.defl=13
    //% min.min=0 min.max=59 min.defl=30
    //% sec.min=0 sec.max=59 sec.defl=0
    //% group="class one"
    //% weight=16
    export function time24v(hour: number, min: number, sec: number) { return new times(hour % 24, min % 60, sec % 60) }

    //% blockId=datetime_halftimeshadow
    //% block="$hour : $min . $sec" advanced=true
    //% hour.min=1 hour.max=12 hour.defl=11
    //% min.min=0 min.max=59 min.defl=30
    //% sec.min=0 sec.max=59 sec.defl=0
    //% group="class one"
    //% weight=13
    export function time12v(hour: number, min: number, sec: number) { return new times(((hour + 11) % 12) + 1, min % 60, sec % 60) }

    export class dtobj {
        public mydatetime: DateTime = { month: 1, day: 1, year: 1, hour: 0, minute: 0, second: 0, dayOfYear: 1, dayOfWeek: 0, daySince: 1}
        public startYear: Year = 1; public cpuTimeAtSetpoint: SecondsCount = 0; public timeToSetpoint: SecondsCount = 0;
        public inProcess: {[id: string]: boolean} = {}; public lastUpdate: DateTime = {month: NaN, day: NaN, year: NaN, hour: NaN, minute: NaN, second: NaN, dayOfYear: NaN, dayOfWeek: NaN, daySince: NaN}
        protected runVal: any;

        public run() {
            /* 
            this ensures that "time" is checked periodically and event handlers are called.  
            */
            this.runVal = setInterval(function () {
                // Only run about every 2 s;  Micro:bit uses a ticker with a 32kHz period, so the count should increase by every 1s with about 65kHz for arcade or etc.
                const cpuTime = cpuTimeInSeconds(), t = timeFor(this, cpuTime)
                this.mydatetime = t
            }, 1000)
        }

        public stop() {
            clearInterval(this.runVal)
        }

        constructor() { this.run() }
    }

    // ********* Enumerations for parameter types ************************

    export let monthName: string[][] = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        ["January", "Febuary", "March", "April", "May", "June", "July", "Orgust", "September", "October", "November", "December"]
    ]

    export let weekName: string[][] = [
        ["0", "1", "2", "3", "4", "5", "6"],
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    ]

    export enum ValueUpdate {
        //% block="Second"
        Second = 0,
        //% block="Minute"
        Minute = 1,
        //% block="Hour"
        Hour = 2,
        //% block="Day"
        Day = 3,
        //% block="Month"
        Month = 4,
        //% block="Year"
        Year = 5,
    }

    export enum DropDatetime {
        //% block="month"
        Month = 0,
        //% block="day of month"
        DayOfMonth = 1,
        //% block="year"
        Year = 2,
        //% block="hour"
        Hour = 3,
        //% block="minute"
        Minute = 4,
        //% block="second"
        Second = 5,
        //% block="day of year"
        DayOfYear = 6,
        //% block="day of week"
        DayOfWeek = 7,
        //% block="day since"
        DaySince = 8
    }

    export enum OffsetWeek {
        //% block="sunday"
        SUN = 6,
        //% block="saturday"
        SAT = 5,
        //% block="monday"
        MON = 0
    }

    export enum MornNight {
        //% block="am"
        AM,
        //% block="pm"
        PM
    }

    export enum TimeUnit {
        //% block="ms"
        Milliseconds,
        //% block="seconds"
        Seconds,
        //% block="minutes"
        Minutes,
        //% block="hours"
        Hours,
        //% block="days"
        Days
    }

    export enum TimeFormat {
        //% block="h:mm.ss am / pm"
        HMMSSAMPM,
        //% block="hh:mm 24-hr"
        HHMM24hr,
        //% block="hh:mm.ss 24-hr"
        HHMMSS24hr,
        //% block="h:mm"
        HMM,
        //% block="h:mm am / pm"
        HMMAMPM,
    }

    export enum DateFormat {
        //% block=day/subweekname/submonthname"
        DWnsMns,
        //% block="day/weekname/monthname"
        DWnMn,
        //% block="month/day"
        MD,
        //% block="month/day/year"
        MDY,
        //% block="year-month-day"
        YYYY_MM_DD
    }

    export enum MonthNameFormat {
        //% block="Fullname"
        Fname,
        //% block="Subname"
        Sname,
    }

    export enum WeekNameFormat {
        //% block="Fullname"
        Fname,
        //% block="3Subname"
        S3name,
        //% block="2Subname"
        S2name,
    }

    export type Month = uint8   // 1-12 Month of year
    export type Day = uint8     // 1-31 / Day of month
    export type Year = uint16 // Assumed to be 0000-0099 or 2020-2099  
    export type Hour = uint8  // 0-23 / 24-hour format  
    export type Minute = uint8 // 0-59 
    export type Second = uint8 // 0-59
    export type DayOfYear = uint16 // 1-366

    export type SecondsCount = uint32 // Seconds since start of start year
    export type Weekday = uint8 // Weekday code. 0=Sunday, 1=Monday, etc.
    export type Weekyear = uint8 // 0-51 (1-52) / Weekyear format

    export interface DateTime {
        month: Month   // 1-12 Month of year
        day: Day   // 1-31 / Day of month
        year: Year  // Assumed to be 2020 or later
        hour: Hour   // 0-23 / 24-hour format  
        minute: Minute   // 0-59 
        second: Second   // 0-59
        dayOfYear: DayOfYear  // 1-366
        dayOfWeek: Weekday // 0-6 / weekday value
        daySince: SecondsCount // Day of since
    }

    export interface Date {
        month: Month   // 1-12 Month of year
        day: Day   // 1-31 / Day of month
        year: Year  // Assumed to be 2020 or later
        dayOfYear: DayOfYear  // 1-366
        dayOfWeek: Weekday // 0-6 / weekday value
        daySince: SecondsCount // Day of since
    }

    export interface MonthDay {
        month: Month   // 1-12 Month of year
        day: Day   // 1-31 / Day of month
    }

    // ********* State Variables ************************

    const TIME_AND_DATE_EVENT = 94
    const TIME_AND_DATE_NEWMINUTE = 1
    const TIME_AND_DATE_NEWHOUR = 2
    const TIME_AND_DATE_NEWDAY = 3

    // State variables to manage time 
    let startYear: Year = 0
    let timeToSetpoint: SecondsCount = 0
    let cpuTimeAtSetpoint: SecondsCount = 0

    /*    
    Time is all relative to the "start year" that is set by setDate() (or 0 by default) as follows:

      Start year          Time Date/Time set        CurrentCPUTime
      |                   | (in s)                  | (in s)
      V                   V                         V
      |-------------------+-------------------------|
                          ^
                          |
                          Known dd/mm/yy hh:mm,.s
                          AND cpuTimeAtSetpoint (in s)
       |------------------|-------------------------|
          timeToSetpoint          deltaTime
          (in s)                  ( in s)
    
        setDate sets the startYear and updates timeToSetpoint and cpuTimeAtSetpoint 
        setTime methods update just timeToSetpoint and cpuTimeAtSetpoint
     */

    // State for event handlers 
    let lastUpdateMinute: Minute = 100   // Set to invalid values for first update
    let lastUpdateHour: Hour = 100
    let lastUpdateDay: Day = 100


    // Cummulative Days of Year (cdoy): Table of month (1-based indices) to cummulative completed days prior to month
    // Ex: By Feb 1st (2nd month / index 2), 31 days of Jan are completed. 
    export const cdoy: DayOfYear[] = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365]

    // ********* Time Calculation / Management ************************


    export function isLeapYear(y: Year): boolean {
        // The /400 and /100 rules don't come into play until 2400 and 2300 or 0100.  We can ignore them here
        // Here's the code for accurate handling of leap years:
        return (y % 400 == 0 || (y % 100 != 0 && y % 4 == 0))

        // Simplified case for 2020-2099.
        // return y % 4 == 0
    }


    // Returns a MonthDay with from a DayOfYear and given Year
    export function dayOfYearToMonthAndDay(d: DayOfYear, y: Year): MonthDay {
        // If it's after Feb in a leap year, adjust
        if (isLeapYear(y)) {
            if (d == 60) {  // Leap Day!
                return { month: 2, day: 29 }
            } else if (d > 60) {
                d -= 1  // Adjust for leap day
            }
        }
        for (let i = 1; i < cdoy.length; i++) {  // Start at 1 for 1- based index
            // If the day lands in (not through) mydt month, return it
            if (d <= cdoy[i + 1]) {
                return { month: i, day: d - cdoy[i] }
            }
        }
        // mydt should never happen!
        return { month: -1, day: -1 }
    }

    export function secondsSoFarForYear(m: Month, d: Day, y: Year, hh: Hour, mm: Minute, ss: Second): SecondsCount {
        // ((((Complete Days * 24hrs/ day)+complete hours)*60min/ hr)+complete minutes)* 60s/ min + complete seconds
        // Yay Horner's Rule!:
        return (((dateToDayOfYear(datev(m, d, y)) - 1) * 24 + hh) * 60 + mm) * 60 + ss
    }

    export function dateSinceFor(dateSince: SecondsCount, offsetSince: SecondsCount = 0, offsetYear: Year = 0): Date {
        // Find elapsed years by counting up from start year and subtracting off complete years
        let startDateCount = dateSince
        if (offsetSince > 0 && dateSince > offsetSince) startDateCount -= offsetSince
        let y = 1
        if (offsetYear > 0) y = offsetYear
        let leap = isLeapYear(y)
        while ((!leap && startDateCount > 365) || (startDateCount > 366)) {
            if (leap) {
                startDateCount -= 366
            } else {
                startDateCount -= 365
            }
            y += 1
            leap = isLeapYear(y)
        }

        // sSinceStartOfYear and leap are now for "y", not "year".  Don't use "year"! Use "y"
        // Find elapsed days
        const daysFromStartOfYear = Math.constrain(startDateCount, 1, (isLeapYear(y)) ? 366 : 365) // +1 offset for 1/1 being day 

        // Convert days to dd/ mm
        const ddmm = dayOfYearToMonthAndDay(daysFromStartOfYear, y) // current year, y, not start year

        const weekv = dateToDayOfWeek(datev(ddmm.month, ddmm.day, y))
        const daysincev = dateToDaySince(datev(ddmm.month, ddmm.day, y))

        return { month: ddmm.month, day: ddmm.day, year: y, dayOfYear: daysFromStartOfYear , dayOfWeek: weekv, daySince: daysincev}
    }

    export function timeFor(mydt: dtobj, cpuTime: SecondsCount): DateTime {
        const deltaTime = cpuTime - mydt.cpuTimeAtSetpoint
        let sSinceStartOfYear = mydt.timeToSetpoint + deltaTime, uSince = sSinceStartOfYear
        // Find elapsed years by counting up from start year and subtracting off complete years
        let y2 = mydt.startYear
        let leap2 = isLeapYear(y2)
        while ((!leap2 && sSinceStartOfYear > 365 * 24 * 60 * 60) || (sSinceStartOfYear > 366 * 24 * 60 * 60)) {
            if (leap2) {
                sSinceStartOfYear -= 366 * 24 * 60 * 60
            } else {
                sSinceStartOfYear -= 365 * 24 * 60 * 60
            }
            y2 += 1
            leap2 = isLeapYear(y2)
        }

        // sSinceStartOfYear and leap are now for "y", not "year".  Don't use "year"! Use "y"
        // Find elapsed days
        const daysFromStartOfYear2 = Math.constrain(Math.floor(sSinceStartOfYear / (24 * 60 * 60))+1, 1, (isLeapYear(y2)) ? 366 : 365)  // +1 offset for 1/1 being day 1 and maximum for 366 if is LeapYear or 365 if not LeapYear
        const secondsSinceStartOfDay = sSinceStartOfYear % (24 * 60 * 60)

        // Find elapsed hours
        const hoursFromStartOfDay = Math.floor(secondsSinceStartOfDay / (60 * 60))
        const secondsSinceStartOfHour = secondsSinceStartOfDay % (60 * 60)

        // Find elapsed minutes
        const minutesFromStartOfHour = Math.floor(secondsSinceStartOfHour / (60))
        // Find elapsed seconds
        const secondsSinceStartOfMinute = secondsSinceStartOfHour % (60)

        // Convert days to dd/ mm
        const ddmm2 = dayOfYearToMonthAndDay(daysFromStartOfYear2, y2) // current year, y, not start year

        const weekv2 = dateToDayOfWeek(datev(ddmm2.month, ddmm2.day, y2))
        const daysincev2 = dateToDaySince(datev(ddmm2.month, ddmm2.day, y2))

        mydt.mydatetime = { month: ddmm2.month, day: ddmm2.day, year: y2, hour: hoursFromStartOfDay, minute: minutesFromStartOfHour, second: secondsSinceStartOfMinute, dayOfYear: daysFromStartOfYear2, dayOfWeek: weekv2, daySince: daysincev2 }
        return mydt.mydatetime
    }

    export function timeSinceFor(timeSince: SecondsCount, offsetSince: SecondsCount = 0, offsetYear: Year = 0): DateTime {
        let sSinceStartOfYear2 = timeSince
        if (offsetSince > 0 && timeSince > offsetSince) sSinceStartOfYear2 -= offsetSince
        // Find elapsed years by counting up from start year and subtracting off complete years
        let y3 = 1
        if (offsetYear > 0) y3 = offsetYear
        let leap3 = isLeapYear(y3)
        while ((!leap3 && sSinceStartOfYear2 > 365 * 24 * 60 * 60) || (sSinceStartOfYear2 > 366 * 24 * 60 * 60)) {
            if (leap3) {
                sSinceStartOfYear2 -= 366 * 24 * 60 * 60
            } else {
                sSinceStartOfYear2 -= 365 * 24 * 60 * 60
            }
            y3 += 1
            leap3 = isLeapYear(y3)
        }

        // sSinceStartOfYear and leap are now for "y", not "year".  Don't use "year"! Use "y"
        // Find elapsed days
        const daysFromStartOfYear3 = Math.constrain(Math.floor(sSinceStartOfYear2 / (24 * 60 * 60)) + 1, 1, isLeapYear(y3) ? 366 : 365) // +1 offset for 1/1 being day 1
        const secondsSinceStartOfDay2 = sSinceStartOfYear2 % (24 * 60 * 60)

        // Find elapsed hours
        const hoursFromStartOfDay2 = Math.floor(secondsSinceStartOfDay2 / (60 * 60))
        const secondsSinceStartOfHour2 = secondsSinceStartOfDay2 % (60 * 60)

        // Find elapsed minutes
        const minutesFromStartOfHour2 = Math.floor(secondsSinceStartOfHour2 / (60))
        // Find elapsed seconds
        const secondsSinceStartOfMinute2 = secondsSinceStartOfHour2 % (60)

        // Convert days to dd/ mm
        const ddmm3 = dayOfYearToMonthAndDay(daysFromStartOfYear3, y3) // current year, y, not start year

        const weekv3 = dateToDayOfWeek(datev(ddmm3.month, ddmm3.day, y3))
        const daysincev3 = dateToDaySince(datev(ddmm3.month, ddmm3.day, y3))

        return { month: ddmm3.month, day: ddmm3.day, year: y3, hour: hoursFromStartOfDay2, minute: minutesFromStartOfHour2, second: secondsSinceStartOfMinute2, dayOfYear: daysFromStartOfYear3, dayOfWeek: weekv3, daySince: daysincev3 }
    }

    export function cpuTimeInSeconds(): uint32 {
        return Math.floor(game.runtime() / 1000)
    }

    // ********* Misc. Utility export functions for formatting ************************
    export function leftZeroPadTo(inp: number, digits: number) {
        let value = inp + ""
        while (value.length < digits) {
            value = "0" + value
        }
        return value
    }


    // 24-hour time:  hh:mm.ss
    export function fullTime(t: DateTime): string {
        return leftZeroPadTo(t.hour, 2) + ":" + leftZeroPadTo(t.minute, 2) + "." + leftZeroPadTo(t.second, 2)
    }

    // Full year: yyyy-mm-dd
    export function fullYear(t: DateTime, yf: boolean = false): string {
        const yv = (yf)?543:0
        return leftZeroPadTo(t.year + yv, 4) + "-" + leftZeroPadTo(t.month, 2) + "-" + leftZeroPadTo(t.day, 2)
    }

}

