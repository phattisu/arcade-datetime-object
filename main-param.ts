

namespace timeanddate {

    // ********* Exposed blocks ************************

    /**
     * get create a new datetime
     */
    //% blockId=timeanddate_newdatetime
    //% block="create new datetime"
    //% inlineInputMode=inline
    //% blockSetVariable="myDateTime"
    //% group="create datetime"
    //% weight=140
    export function newDatetime() { return new dtobj() }

    //% blockId=timeanddate_mydt_getdateclass
    //% block="get $mydt as date class month/day/year" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="class one"
    //% weight=9
    export function mydtAsDateC(mydt: dtobj) { return new dates(((mydt.mydatetime.month - 1) % 12) + 1, ((mydt.mydatetime.day - 1) % 31) + 1, mydt.mydatetime.year) }

    //% blockId=timeanddate_mydt_gettime24class
    //% block="get $mydt as 24time class hour/minute/second" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% shim=DateTime::mydtAsT24c
    //% group="class one"
    //% weight=6
    export function mydtAsT24c(mydt: dtobj) { return new times(mydt.mydatetime.hour % 24, mydt.mydatetime.minute % 60, mydt.mydatetime.second % 60) }

    //% blockId=timeanddate_mydt_gettime24class
    //% block="get $mydt as 12time class hour/minute/second" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="class one"
    //% weight=3
    export function mydtAsT12c(mydt: dtobj) { return new times(((mydt.mydatetime.hour + 11) % 12) + 1, mydt.mydatetime.minute % 60, mydt.mydatetime.second % 60) }

    /**
     * get the datetime value from kind data
     * @param dropdown of datetime list
     * @param datetime kind to get
     */
    //% blockId=timeanddate_getvaluefromkinddata
    //% block=" $mydt get datetime value as $dt"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% inlineInputMode=inline
    //% shim=TimeAndDate::getDataFromDtObj
    //% group="number of datetime"
    //% weight=133
    export function getDataFromDtObj(mydt: dtobj, dt: DropDatetime) {
        const udatetime = mydt.mydatetime
        switch (dt) {
            case 0: return udatetime.month; break;
            case 1: return udatetime.day; break;
            case 2: return udatetime.year; break;
            case 3: return udatetime.hour; break;
            case 4: return udatetime.minute; break;
            case 5: return udatetime.second; break;
            case 6: return udatetime.dayOfYear; break;
            case 7: return udatetime.dayOfWeek; break;
            case 8: return udatetime.daySince; break;
        }
        return -1
    }

    /**
     * Set the time using 24-hour format. 
     * @param mydt is the datetime object as mydatetime
     * @param time from hour the hour (0-23), minute the minute (0-59), @param second the second (0-59)
     */
    //% blockid=timeanddate_set24hrtime
    //% block=" $mydt set time from 24-hour time $times"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% times.shadow=timeanddate_timeshadow
    //% group="time setting"
    //% weight=90
    export function set24HourTime(mydt: dtobj, times: times) {
        let hour = times.hour, minute = times.minute, second = times.second
        hour = hour % 24
        minute = minute % 60
        second = second % 60
        const cpuTime2 = cpuTimeInSeconds()
        const u = timeFor(mydt, cpuTime2)
        mydt.cpuTimeAtSetpoint = cpuTime2
        mydt.timeToSetpoint = secondsSoFarForYear(u.month, u.day, u.year, hour, minute, second)
    }

    /**
     * Set the date
     * @param mydt is the datetime object as mydatetime
     * @param date from month the month 1-12, day the day of the month 1-31, @param the year 2020-2050
     */
    //% blockid=timeanddate_setdate
    //% block=" $mydt set date to $dates"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% dates.shadow=timeanddate_dateshadow
    //% group="date setting"
    //% weight=80
    export function setDate(mydt: dtobj, dates: dates) {
        let year = dates.year, month = dates.month, day = dates.day
        month = ((month - 1) % 12) + 1
        day = ((day - 1) % 31) + 1
        const cpuTime3 = cpuTimeInSeconds()
        const v = timeFor(mydt, cpuTime3)
        mydt.startYear = year
        mydt.cpuTimeAtSetpoint = cpuTime3
        mydt.timeToSetpoint = secondsSoFarForYear(month, day, mydt.startYear, v.hour, v.minute, v.second)
    }

    /**
     * Set the time using am/pm format
     * @param mydt is the datetime object as mydatetime
     * @param time from hour the hour (1-12), minute the minute (0-59), second the second (0-59)
     * @param ampm morning or night
     */
    //% block=timeanddate_settime
    //% block=" $mydt set time to $times as $ampm"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% times.shadow=timeanddate_halftimeshadow
    //% inlineInputMode=inline
    //% group="time setting"
    //% weight=100
    export function set12HourTime(mydt: dtobj, times: times, ampm: MornNight) {
        let hour2 = times.hour, minute2 = times.minute, second2 = times.second
        hour2 = (hour2 - 1 % 12) + 1
        // Adjust to 24-hour time format
        if (ampm == MornNight.AM && hour2 == 12) {  // 12am -> 0 hundred hours
            hour2 = 0;
        } else if (ampm == MornNight.PM && hour2 != 12) {   // PMs other than 12 get shifted after 12:00 hours
            hour2 + 12;
        }
        set24HourTime(mydt, time24v(hour2, minute2, second2));
    }

    /**
     * Advance the time by the given amount, which cause "carries" into other aspects of time/date.  Negative values will cause time to go back by the amount.
     * @param mydt is the datetime object as mydatetime
     * @param amount the amount of time to add (or subtract if negative).  To avoid "carries" use withTime blocks
     * @param unit the unit of time
     */
    //% blockid=timeanddate_advancesetdatetime
    //% block=" $mydt advance time/date by $amount $unit" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="advance setting"
    //% weight=50
    export function advanceBy(mydt: dtobj, amount: number, unit: TimeUnit) {
        const units = [0, 1, 60 * 1, 60 * 60 * 1, 24 * 60 * 60 * 1]
        // Don't let time go negative:
        if (amount < 0 && (-amount * units[unit]) > mydt.timeToSetpoint)
            mydt.timeToSetpoint = 0
        else
            mydt.timeToSetpoint += amount * units[unit]
    }

    /**
     * Get day since from date
     * @param date of month day year
     */
    //% blockid=timeanddate_datetodaysince
    //% block="day since as $dates" advanced=true
    //% dates.shadow=timeanddate_dateshadow
    //% group="calculate"
    //% weight=20
    export function dateToDaySince(dates: dates): SecondsCount {
        let uyear = dates.year, umonth = dates.month, uday = dates.day
        umonth = Math.constrain(umonth, 1, 12)
        let daySince = 0
        for (let yidx = 1; yidx < uyear; yidx++) daySince += (isLeapYear(yidx)) ? 366 : 365;
        daySince += dateToDayOfYear(datev(umonth, uday, uyear))
        return daySince
    }

    /**
     * Get time since from date and time
     * @param date of month day year
     * @param time of hour minute second
     */
    //% blockid=timeanddate_datetodaysince
    //% block="time since as $dates and $times" advanced=true
    //% dates.shadow=timeanddate_dateshadow
    //% times.shadow=timeanddate_timeshadow
    //% group="calculate"
    //% weight=20
    export function dateAndTimeToTimeSince(dates: dates, times: times): SecondsCount {
        let uyear2 = dates.year, umonth2 = dates.month, uday2 = dates.day
        let uhour = times.hour, uminute = times.minute, usecond = times.second
        umonth2 = Math.constrain(umonth2, 1, 12)
        let timeSince = 0
        for (let yidx2 = 1; yidx2 < uyear2; yidx2++) timeSince += ((isLeapYear(yidx2)) ? 366 : 365) * (24 * 60 * 60);
        timeSince += dateToDayOfYear(datev(umonth2, uday2, uyear2)) * (24 * 60 * 60)
        timeSince += (uhour % 24) * (60 * 60), timeSince += (uminute % 60) * (60), timeSince += (usecond % 60)
        return timeSince
    }

    /**
     * Get the Day of the week  
     * @param 0=>Monday, 1=>Tuesday, etc.
     */
    //% blockid=timeanddate_date2dayweek
    //% block="day of week for $datei" advanced=true
    //% datei.shadow=timeanddate_dateshadow
    //% group="calculate"
    //% weight=40
    export function dateToDayOfWeek(datei: dates): Weekday {
        let yv2 = datei.year
        let doy = dateToDayOfYear(datei)
        // Gauss's Algorithm for Jan 1: https://en.wikipedia.org/wiki/Determination_of_the_day_of_the_week
        // R(1+5R(A-1,4)+4R(A-1,100)+6R(A-1,400),7)    
        let jan1 = ((1 + (5 * ((yv2 - 1) % 4)) + (4 * ((yv2 - 1) % 100)) + (6 * ((yv2 - 1) % 400))) % 7)
        jan1 += 6  // Shift range:  Gauss used 0=Sunday, we'll use 0=Monday
        return ((doy - 1) + jan1) % 7
    }

    /**
     * Get the Week of year
     * @param weekofyear are minimum for 0 and maximum for 51
     */
    //% blockId=timeanddate_date2weekofyear
    //% block="week of year for $datei" advanced=true
    //% datei.shadow=timeanddate_dateshadow
    //% group="calculate"
    //% weight=35
    export function dateToWeekOfYear(datei: dates): Weekyear {
        let yv3 = datei.year
        let doy2 = dateToDayOfYear(datei)
        let jan12 = ((1 + (5 * ((yv3 - 1) % 4)) + (4 * ((yv3 - 1) % 100))) + ((6 * ((yv3 - 1) % 400))) % 7)
        jan12 += 6
        let dwoy = ((doy2 - 1) + jan12)
        return Math.floor(dwoy / 7) % 52
    }

    /**
     * Get the Day of the year  
     * @param Jan 1 = 1, Jan 2=2, Dec 31 is 365 or 366
     */
    //% blockid=timeanddate_date2dayyear
    //% block="day of year for $dates" advanced=true
    //% dates.shadow=timeanddate_dateshadow
    //% group="calculate"
    //% weight=30
    export function dateToDayOfYear(dates: dates): DayOfYear {
        let year2 = dates.year, month2 = dates.month, day2 = dates.day
        month2 = Math.constrain(month2, 1, 12)
        // Assumes a valid date
        let dayOfYear = cdoy[month2] + day2
        // Handle after Feb in leap years:
        if (month2 > 2 && isLeapYear(year2)) {
            dayOfYear += 1
        }
        return dayOfYear
    }

    /**
     * calculate my age from my birthdate in current date
     * @param mydt the datetimeobject for current datetime
     * @param idate the birthdate value
     */
    //% blockId=timeanddate_mydatetoage
    //% block=" $mydt get age from birthdate by $idate in current date" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% idate.shadow=timeanddate_dateshadow
    //% group="calculate"
    //% weight=14
    export function myDateToAge(mydt: dtobj, idate: dates) {
        let age = mydt.mydatetime.year - idate.year
        if (mydt.mydatetime.month < idate.month || (mydt.mydatetime.month == idate.month && mydt.mydatetime.day < idate.day)) age--
        return age
    }

    /**
     * create calendar table from date
     * @param idate the date to create raw calendar
     * @param startweek the offset week for calendar
     * @param max row grid
     * @param camera calendar mode
     */
    //% blockid=timeanddate_datetable
    //% block="raw calendar table as $idate in $startweek|| and max row $rowv and camera mode $cammode" advanced=true
    //% idate.shadow=timeanddate_dateshadow
    //% rowv.min=1 rowv.max=3 rowv.defl=2
    //% cammode.shadow=toggleYesNo
    //% group="calculate"
    //% weight=15
    export function dateAsTableList(idate: dates, startweek: OffsetWeek, rowv: number = 0, cammode: boolean = false): number[] {
        let dateCountI = dateToDaySince(idate), dateI = dateSinceFor(dateCountI)
        let dateWeek = dateToDayOfWeek(datev(dateI.month, dateI.day, dateI.year))
        let camrow = (rowv > 2 && cammode) ? Math.floor(rowv / 2) : 0
        while ((cammode && camrow > 0) || (!cammode && (rowv > 0 && dateWeek != startweek) || (rowv <= 0 && (dateI.month == idate.month || dateWeek != startweek)))) {
            if (dateSinceFor(dateCountI - 1).month != idate.month && dateWeek == startweek) break;
            dateCountI--
            if (dateCountI < 0) return []
            dateI = dateSinceFor(dateCountI)
            dateWeek = dateToDayOfWeek(datev(dateI.month, dateI.day, dateI.year))
            if (cammode && (camrow > 0 && dateWeek == startweek)) camrow--
        }
        let tableDate: number[] = []
        let tableCol = 7, tableRow = (rowv > 0) ? rowv : 6
        for (let tableidx = 0; tableidx < tableCol * tableRow; tableidx++) {
            dateI = dateSinceFor(dateCountI + tableidx)
            tableDate.push((idate.month == dateI.month) ? dateI.day : -dateI.day)
        }
        return tableDate
    }

    /**
     * create calendar table from date
     * @param myDate the current date
     * @param startweek the offset week for calendar
     * @param max row grid
     * @param camera calendar mode
     * @param the forground color
     * @param the background color
     */
    //% blockid=timeanddate_calendarimage
    //% block="calendar as image $myDate in $startweek|| maxrow $rowv camera mode $cammode fgcolor $fgcol bgcolor $bgcol"
    //% myDate.shadow=variables_get myDate.defl=myDateTime
    //% fgcol.shadow=colorindexpicker
    //% bgcol.shadow=colorindexpicker
    //% rowv.min=1 rowv.max=3 rowv.defl=2
    //% cammode.shadow=toggleYesNo
    //% group="image output"
    //% weight=15
    export function calendarImage(myDate: dtobj, startweek: OffsetWeek, rowv: number = 0, cammode: boolean = false, fgcol: number = 1, bgcol: number = 15) {
        if (myDate.inProcess["calendar"]) return image.create(16, 16)
        myDate.inProcess["calendar"] = true
        let calennum: number[] = dateAsTableList(datev(myDate.mydatetime.month, myDate.mydatetime.day, myDate.mydatetime.year), startweek, rowv, cammode)
        if (calennum.length <= 0) {
            myDate.inProcess["calendar"] = false
            return image.create(16, 16)
        }
        let calenstr: string[] = []
        for (let j = 0; j < 7; j++) {
            calenstr.push(weekName[1][(j + startweek) % 7].substr(0, 2).toUpperCase())
        }
        for (let val of calennum) {
            if (val < 0) {
                val = Math.abs(val)
            }
            calenstr.push(val.toString())
        }
        let twidth = 15, theight = 9, gtcol = 7, gtrow = (rowv > 0) ? rowv + 1 : 7
        let outputimg: Image = image.create((gtcol * twidth) + 1, (gtrow * theight) + 1)
        control.runInParallel(function() {
            outputimg.fill(bgcol)
            outputimg.drawRect(0, 0, (gtcol * twidth) + 1, (gtrow * theight) + 1, fgcol)
            for (let k = 1; k < gtcol; k++) outputimg.fillRect((k * twidth), 0, 1, outputimg.height, fgcol)
            for (let l = 1; l < gtrow; l++) outputimg.fillRect(0, (l * theight), outputimg.width, 1, fgcol)
            outputimg.fillRect(0, 0, (gtcol * twidth) + 1, theight + 1, fgcol)
            outputimg.fillRect(0, theight - 1, (gtcol * twidth) + 1, 1, bgcol)
            outputimg.drawRect(0, 0, (gtcol * twidth) + 1, (gtrow * theight) + 1, fgcol)
            for (let m = 0; m < calenstr.length; m++) {
                const gcol = m % 7, grow = Math.floor(m / 7), txt = calenstr[m]
                if (grow > 0) {
                    const cnum = calennum[Math.max(0, m - 7)]
                    outputimg.print(txt, 1 + (gcol * twidth) + Math.floor((twidth / 2) - ((txt.length * 6) / 2)), 1 + (grow * theight) + Math.floor((theight / 2) - (8 / 2)), fgcol)
                    if (cnum > 0) {
                        if (myDate.mydatetime.day == cnum) {
                            outputimg.fillRect(gcol * twidth, grow * theight, twidth + 1, theight + 1, fgcol)
                            outputimg.print(txt, 1 + (gcol * twidth) + Math.floor((twidth / 2) - ((txt.length * 6) / 2)), 1 + (grow * theight) + Math.floor((theight / 2) - (8 / 2)), bgcol)
                        }
                    }
                } else {
                    outputimg.print(txt, 1 + (gcol * twidth) + Math.floor((twidth / 2) - ((txt.length * 6) / 2)), (grow * theight) + Math.floor((theight / 2) - (8 / 2)), bgcol)
                }
            }
        })
        myDate.inProcess["calendar"] = false
        return outputimg
    }

    /**
     * Get all values of time as numbers. 
     * @param mydt is the datetime object as mydatetime
     */
    //% blockid=timeanddate_alldatetimetogetinstatement
    //% block=" $mydt date and time as numbers $hour:$minute.$second on $month/$day/$year" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% handlerStatement
    //% draggableParameters="reporter"
    //% group="param in state"
    //% weight=100
    export function numericTime(mydt: dtobj, handler: (hour: Hour, minute: Minute, second: Second, month: Month, day: Day, year: Year) => void) {
        const cpuTime4 = cpuTimeInSeconds()
        const w = timeFor(mydt, cpuTime4)
        handler(w.hour, w.minute, w.second, w.month, w.day, w.year)
    }

    /**
     * Current time as a string in the format
     * @param mydt is the datetime object as mydatetime
     * @param format the format to use
     */
    //% blockid=timeanddate_time2format
    //% block=" $mydt time as $format"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="text output"
    //% weight=70
    export function time(mydt: dtobj, format: TimeFormat): string {
        const cpuTime5 = cpuTimeInSeconds()
        const a = timeFor(mydt, cpuTime5)

        // Handle 24-hour format with helper
        if (format == TimeFormat.HHMMSS24hr)
            return fullTime(a)

        // Format minutes for all remaining formats
        let minute3 = leftZeroPadTo(a.minute, 2)

        // Simpler military format
        if (format == TimeFormat.HHMM24hr)
            return leftZeroPadTo(a.hour, 2) + ":" + minute3

        // Data for all other formats
        // Compute strings for other formats
        let hour3 = null
        let ap = a.hour < 12 ? "am" : "pm"
        if (a.hour == 0) {
            hour3 = "12:"  // am
        } else if (a.hour > 12) {
            hour3 = (a.hour - 12) + ":"
        } else {
            hour3 = (a.hour) + ":"
        }

        // Compose them appropriately
        switch (format) {
            case TimeFormat.HMMSSAMPM:
                return hour3 + minute3 + "." + leftZeroPadTo(a.second, 2) + ap

            case TimeFormat.HMMAMPM:
                return hour3 + minute3 + ap

            case TimeFormat.HMM:
                return hour3 + minute3
        }
        return ""
    }

    /**
     * Current date month name as a string in the format name
     * @param mydt is the datetime object as mydatetime
     * @param format the format to use
     */
    //% blockid=timeanddate_datemonth2format 
    //% block=" $mydt month name as $format"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="text output"
    //% weight=20
    export function nameMonth(mydt: dtobj, format: MonthNameFormat): string {
        const cpuTime6 = cpuTimeInSeconds()
        const b = timeFor(mydt, cpuTime6)
        const dtIdx = monthName[0].indexOf(b.month.toString())
        const dtName = monthName[1][dtIdx]
        switch (format) {
            case MonthNameFormat.Fname:
                return dtName
                break
            case MonthNameFormat.Sname:
                return dtName.substr(0, 3)
                break
        }
        return ""
    }

    /**
     * Current date week name as a string in the format name
     * @param mydt is the datetime object as mydatetime
     * @param format the format to use
     */
    //% blockid=timeanddate_dateweek2format
    //% block=" $mydt week name as $format"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="text output"
    //% weight=20
    export function nameWeek(mydt: dtobj, format: WeekNameFormat): string {
        const cpuTime7 = cpuTimeInSeconds()
        const c = timeFor(mydt, cpuTime7)
        const d = dateToDayOfWeek(datev(c.month, c.day, c.year))
        const dtIdx2 = weekName[0].indexOf(d.toString())
        const dtName2 = weekName[1][dtIdx2]
        switch (format) {
            case WeekNameFormat.Fname:
                return dtName2
                break
            case WeekNameFormat.S3name:
                return dtName2.substr(0, 3)
                break
            case WeekNameFormat.S2name:
                return dtName2.substr(0, 2)
                break
        }
        return ""
    }

    /**
     * Current date as a string in the format
     * @param mydt is the datetime object as mydatetime
     * @param format the format to use
     * @param ytype the year type to use
     */
    //% blockid=timeanddate_date2format
    //% block=" $mydt date as $format|| for buddhist year $ytype"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% yf.shadow=toggleYesNo
    //% group="text output"
    //% weight=60
    export function date(mydt: dtobj, format: DateFormat, yf: boolean = false): string {
        const cpuTime8 = cpuTimeInSeconds()
        const e = timeFor(mydt, cpuTime8)
        const f = dateToDayOfWeek(datev(e.month, e.day, e.year))
        const dtIdx3 = [monthName[0].indexOf(e.month.toString()), weekName[0].indexOf(f.toString())]
        const dtName3 = [monthName[1][dtIdx3[0]], weekName[1][dtIdx3[1]]]
        switch (format) {
            case DateFormat.DWnsMns:
                return e.day + "/" + dtName3[1].substr(0, 3).toUpperCase() + "/" + dtName3[0].substr(0, 3).toUpperCase()
                break
            case DateFormat.DWnMn:
                return e.day + "/" + dtName3[1] + "/" + dtName3[0]
                break
            case DateFormat.MD:
                return e.month + "/" + e.day
                break
            case DateFormat.MDY:
                e.year += (yf) ? 543 : 0
                return e.month + "/" + e.day + "/" + e.year
                break
            case DateFormat.YYYY_MM_DD:
                return fullYear(e, yf)
                break

        }
        return ""
    }

    /**
     * Current date and time in a timestamp format (YYYY-MM-DD HH:MM.SS).  
     */
    //% blockid=timeanddate_dateandtime 
    //% block=" $mydt date and time stamp|| for buddhist year $yf"
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% yf.shadow=toggleYesNo
    //% group="text output"
    //% weight=50
    export function dateTime(mydt: dtobj, yf: boolean = false): string {
        const cpuTime9 = cpuTimeInSeconds()
        const g = timeFor(mydt, cpuTime9)
        return fullYear(g, yf) + " " + fullTime(g)
    }

    /**
     * Seconds since start of arcade 
     */
    //% blockid=timeanddate_secondsincereset
    //% block="seconds since arcade start" advanced=true
    //% group="runtime"
    //% weight=40
    export function secondsSinceReset(): number {
        return cpuTimeInSeconds()
    }


    /**
     * Called when get changed
     * @param mydt the datetime object
     * @param type of value update
     */
    //% blockid=timeanddate_onchanged
    //% block=" $mydt on $updtype changed do" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% handlerStatement
    //% group="state update"
    //% weight=85
    export function onChanged(mydt: dtobj, updtype: ValueUpdate, thendo: () => void) {
        switch (updtype) {
            case 0:
                if (mydt.lastUpdate.second == mydt.mydatetime.second) break;
                // New second
                mydt.lastUpdate.second = mydt.mydatetime.second; thendo()
                break; case 1:
                if (mydt.lastUpdate.minute == mydt.mydatetime.minute) break;
                // New minute
                mydt.lastUpdate.minute = mydt.mydatetime.minute; thendo()
                break; case 2:
                if (mydt.lastUpdate.hour == mydt.mydatetime.hour) break;
                // New hour
                mydt.lastUpdate.hour = mydt.mydatetime.hour; thendo()
                break; case 3:
                if (mydt.lastUpdate.day == mydt.mydatetime.day) break;
                // New day
                mydt.lastUpdate.day = mydt.mydatetime.day; thendo()
                break; case 4:
                if (mydt.lastUpdate.month == mydt.mydatetime.month) break;
                // New month
                mydt.lastUpdate.month = mydt.mydatetime.month; thendo()
                break; case 5:
                if (mydt.lastUpdate.year == mydt.mydatetime.year) break;
                // New year
                mydt.lastUpdate.year = mydt.mydatetime.year; thendo()
                break;
        }
    }

    /**
     * get true when changed
     * @param mydt the datetime object
     */
    //% blockId=timeanddate_ifchanged
    //% block="$mydt $updtype is changed" advanced=true
    //% mydt.shadow=variables_get mydt.defl=myDateTime
    //% group="state update"
    //% weight=83
    export function isChanged(mydt: dtobj, updtype: ValueUpdate) {
        switch (updtype) {
            case 0:
                if (mydt.lastUpdate.second == mydt.mydatetime.second) break;
                // New second
                mydt.lastUpdate.second = mydt.mydatetime.second; return true
            case 1:
                if (mydt.lastUpdate.minute == mydt.mydatetime.minute) break;
                // New minute
                mydt.lastUpdate.minute = mydt.mydatetime.minute; return true
            case 2:
                if (mydt.lastUpdate.hour == mydt.mydatetime.hour) break;
                // New hour
                mydt.lastUpdate.hour = mydt.mydatetime.hour; return true
            case 3:
                if (mydt.lastUpdate.day == mydt.mydatetime.day) break;
                // New day
                mydt.lastUpdate.day = mydt.mydatetime.day; return true
            case 4:
                if (mydt.lastUpdate.month == mydt.mydatetime.month) break;
                // New month
                mydt.lastUpdate.month = mydt.mydatetime.month; return true
            case 5:
                if (mydt.lastUpdate.year == mydt.mydatetime.year) break;
                // New year
                mydt.lastUpdate.year = mydt.mydatetime.year; return true
        }
        return false
    }

    // ***************** mydt was just for debugging / evaluate problems in API
    // Helpful for debugging / testing
    // /**
    //  * Seconds since start of year  
    //  */
    // //% block="seconds since year" advanced=true
    // export function secondsSinceYear(): number {
    //     const cpuTime = cpuTimeInSeconds()
    //     const t = timeFor(cpuTime)
    //     const deltaTime = cpuTime - cpuTimeAtSetpoint
    //     let sSinceStartOfYear = timeToSetpoint + deltaTime
    //     return sSinceStartOfYear
    // }

    // ********************************************************

}
