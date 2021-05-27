var Canlendar = (function () {
    // 数据层
    var dataLibrary = {
        /*
         * 农历1900-2100的润大小信息表
         * 0x代表十六进制，后面的是十六进制数
         * 例：1980年的数据是：0x095b0
            二进制：0000 1001 0101 1011 0000
            | ------------------------------- |
            |  0000 | 1001 0101 1011 | 0000   |
            | ------------------------------- |
            |  1~4  |      5~16     | 17~20   |
            | ------------------------------- |
            1-4: 表示当年有无闰年，有的话，为闰月的月份，没有的话，为0。
            5-16：为除了闰月外的正常月份是大月还是小月，1为30天，0为29天。
            17-20：表示闰月是大月还是小月，仅当存在闰月的情况下有意义。
            表示1980年没有闰月，从1月到12月的天数依次为：30、29、29、30、29、30、29、30、30、29、30、30。
        */
        lunarInfo: [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
            0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, // 1970-1979
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
            0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0  // 2040-2049
        ],
        solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],  // 阳历每个月的天数普通表
        AnimalsArr: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],  // 十二生肖
        solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"],  // 二十四节气表
        solarTermInfo: [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758],  // 24节气阳历日期表
        numberToHanzi_1: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],   // 数字转汉字表1
        numberToHanzi_2: ['初', '十', '廿', '卅'],  // 数字转汉字表2
        // 阳历节日
        solarFestival: ["0101 元旦", "0214 情人节", "0308 妇女节", "0312 植树节", "0315 消费者权益日", "0401 愚人节", "0501 劳动节", "0504 青年节", "0512 护士节", "0601 儿童节", "0701 建党节", "0801 建军节", "0910 教师节", "0928 孔子诞辰", "1001 国庆节", "1006 老人节", "1024 联合国日", "1224 平安夜", "1225 圣诞节"],
        // 农历节日
        lunarFestival: ["0101 春节", "0115 元宵节", "0505 端午节", "0707 七夕", "0715 中元节", "0815 中秋节", "0909 重阳节", "1208 腊八节", "1224 小年"],
        todayDay: new Date().getDate(), // 今天是哪一日
        todayMonth: new Date().getMonth(), // 今天是哪一月
        todayYear: new Date().getFullYear(), // 今天是哪一年
        MothersDay: 0, // 母亲节
        FathersDay: 0, // 父亲节
        monthPlusOne: '', // 保存y年m+1月的相关信息
        calendar: '' // 在表格中显示阳历和农历的日期,以及相关节日
    }
    // 方法层
    var functionLibrary = {
        // 返回农历y年的总天数
        leapYearDays: function (y) {
            var i, sum = 348;
            for (i = 0x8000; i > 0x8; i >>= 1) {
                sum += (dataLibrary.lunarInfo[y - 1900] & i) ? 1 : 0;
            }
            return (sum + functionLibrary.leapMonthDays(y));
        },
        // 返回农历y年闰月的天数
        leapMonthDays: function (y) {
            if (functionLibrary.whitchMonthLeap(y)) {
                return ((dataLibrary.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
            } else {
                return (0);
            }
        },
        // 判断y年的农历中那个月是闰月,不是闰月返回0
        whitchMonthLeap: function (y) {
            return (dataLibrary.lunarInfo[y - 1900] & 0xf);
        },
        // 返回农历y年m月的总天数
        monthDays: function (y, m) {
            return ((dataLibrary.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
        },
        // 返回阳历y年m+1月的天数
        solarDays: function (y, m) {
            if (m === 1) {
                return (((y % 4 === 0) && (y % 100 != 0) || (y % 400 === 0)) ? 29 : 28);
            } else {
                return (dataLibrary.solarMonth[m]);
            }
        },
        // 记录阳历和农历某天的日期
        calendarElement: function (solarYear, solarMonth, solarDay, week, lunarYear, lunarMonth, lunarDay, isLeap) {
            this.isToday = false;
            this.week = week;
            // 阳历
            this.solarYear = solarYear;
            this.solarMonth = solarMonth;
            this.solarDay = solarDay;
            // 农历
            this.lunarYear = lunarYear;
            this.lunarMonth = lunarMonth;
            this.lunarDay = lunarDay;
            this.isLeap = isLeap;
            // 节日记录
            this.lunarFestival = ''; // 农历节日
            this.solarFestival = ''; // 阳历节日
            this.solarTerms = ''; // 节气
        },
        // 返回某年的第n个节气为几号(从0小寒起算)
        solarTermFun: function (y, n) {
            var offDate = new Date((31556925974.7 * (y - 1900) + dataLibrary.solarTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
            return (offDate.getUTCDate())
        },
        // 算出当前月第一天的农历日期和当前农历日期下一个月农历的第一天日期
        calculateFirstDay: function (objDate) {
            var i, leap = 0, temp = 0;
            var baseDate = new Date(1900, 0, 31);
            var offset = (objDate - baseDate) / 86400000;
            this.dayCycle = offset + 40;
            this.monthCycle = 14;
            for (i = 1900; i < 2050 && offset > 0; i++) {
                temp = functionLibrary.leapYearDays(i)
                offset -= temp;
                this.monthCycle += 12;
            }
            if (offset < 0) {
                offset += temp;
                i--;
                this.monthCycle -= 12;
            }
            this.year = i;
            this.yearCycle = i - 1864;
            leap = functionLibrary.whitchMonthLeap(i); // 闰哪个月
            this.isLeap = false;
            for (i = 1; i < 13 && offset > 0; i++) {
                if (leap > 0 && i === (leap + 1) && this.isLeap === false) { // 闰月
                    --i;
                    this.isLeap = true;
                    temp = functionLibrary.leapMonthDays(this.year);
                } else {
                    temp = functionLibrary.monthDays(this.year, i);
                }
                if (this.isLeap === true && i === (leap + 1)) this.isLeap = false; // 解除闰月
                offset -= temp;
                if (this.isLeap === false) this.monthCycle++;
            }
            if (offset === 0 && leap > 0 && i === leap + 1)
                if (this.isLeap) {
                    this.isLeap = false;
                } else {
                    this.isLeap = true;
                    --i;
                    --this.monthCycle;
                }
            if (offset < 0) {
                offset += temp;
                --i;
                --this.monthCycle;
            }
            this.month = i;
            this.day = offset + 1;
        },
        // 用中文显示农历的日期
        ChineseDay: function (date) {
            date = Math.floor(date)
            var ChineseDate;
            switch (date) {
                case 10:
                    ChineseDate = '初十';
                    break;
                case 20:
                    ChineseDate = '二十';
                    break;
                    break;
                case 30:
                    ChineseDate = '三十';
                    break;
                    break;
                default:
                    ChineseDate = dataLibrary.numberToHanzi_2[Math.floor(date / 10)];
                    ChineseDate += dataLibrary.numberToHanzi_1[date % 10];
            }
            return (ChineseDate);
        },
        // 计算日期
        calendarDate: function (year, month) {
            dataLibrary.MothersDay = dataLibrary.FathersDay = 0;
            var solarDateObj, lunarDateObj, lunarYear, lunarMonth, lunarDay = 1;
            var lunarLeap; // 农历是否闰月
            var lunarLastDay = 0; // 农历当月最後一天
            var whatDay_1, whatDay_2;
            var lunarDayPositionArr = new Array(3);
            var n = 0;
            var firstLunarMonth = ''; // 农历第一个月
            solarDateObj = new Date(year, month, 1); // 当月第一天的日期
            this.length = functionLibrary.solarDays(year, month); // 阳历当月天数
            this.solarFirstDayWhatDay = solarDateObj.getDay(); // 阳历当月1号星期几
            if (month + 1 === 5) {
                dataLibrary.MothersDay = solarDateObj.getDay()
            }
            if (month + 1 === 6) {
                dataLibrary.FathersDay = solarDateObj.getDay()
            }
            for (var i = 0; i < this.length; i++) {
                if (lunarDay > lunarLastDay) {
                    solarDateObj = new Date(year, month, i + 1); // 当月第一天的日期
                    lunarDateObj = new functionLibrary.calculateFirstDay(solarDateObj); // 农历
                    lunarYear = lunarDateObj.year; // 农历年
                    lunarMonth = lunarDateObj.month; // 农历月
                    lunarDay = lunarDateObj.day; // 农历日
                    lunarLeap = lunarDateObj.isLeap; // 农历是否闰月
                    lunarLastDay = lunarLeap ? functionLibrary.leapMonthDays(lunarYear) : functionLibrary.monthDays(lunarYear, lunarMonth);
                    if (lunarMonth === 12) {
                        dataLibrary.monthPlusOne = lunarLastDay
                    }
                    if (n === 0) {
                        firstLunarMonth = lunarMonth;
                    } else {
                        lunarDayPositionArr[n++] = i - lunarDay + 1;
                    }
                }
                this[i] = new functionLibrary.calendarElement(year, month + 1, i + 1, dataLibrary.numberToHanzi_1[(i + this.solarFirstDayWhatDay) % 7], lunarYear, lunarMonth, lunarDay++, lunarLeap);
                if ((i + this.solarFirstDayWhatDay) % 7 === 0) {
                    this[i].color = 'red'; // 周日颜色
                }
            }
            // 节气
            whatDay_1 = functionLibrary.solarTermFun(year, month * 2) - 1;
            whatDay_2 = functionLibrary.solarTermFun(year, month * 2 + 1) - 1;
            this[whatDay_1].solarTerms = dataLibrary.solarTerm[month * 2];
            this[whatDay_2].solarTerms = dataLibrary.solarTerm[month * 2 + 1];
            if (year === dataLibrary.todayYear && month === dataLibrary.todayMonth) { // 今日
                this[dataLibrary.todayDay - 1].isToday = true;
            }
        },
        // 计算节日
        calendarFestival: function (SolarYear, SolarMonth) {
            dataLibrary.calendar = new functionLibrary.calendarDate(SolarYear, SolarMonth);
            Animal.innerHTML = '&nbsp;' + dataLibrary.AnimalsArr[(SolarYear - 4) % 12] + '年&nbsp;'; // 生肖
            for (var i = 0; i < 42; i++) {
                var _lunarFestival = null; // 农历节日
                var _solarFestival = null; // 阳历节日
                var solarDayObj = eval('SolarDay' + i);
                var lunarDayObj = eval('LunarDay' + i);
                solarDayObj.className = '';
                var item = i - dataLibrary.calendar.solarFirstDayWhatDay;
                if (item > -1 && item < dataLibrary.calendar.length) { // 在当前的日期表中显示
                    var solarFestival = dataLibrary.calendar[item].solarFestival;
                    var lunarFestival = dataLibrary.calendar[item].lunarFestival;
                    solarDayObj.innerHTML = item + 1;
                    if (dataLibrary.calendar[item].isToday) { // 今日颜色
                        solarDayObj.style.color = 'red';
                        solarDayObj.style.fontWeight = '900';
                        solarDayObj.style.borderBottom = 'thin solid red';
                    } else { // 其他日期颜色
                        solarDayObj.style.color = '';
                        solarDayObj.style.fontWeight = '';
                        solarDayObj.style.borderBottom = '';
                    }
                    if (functionLibrary.ChineseDay(dataLibrary.calendar[item].lunarDay) === '初一') { // 显示农历月
                        lunarDayObj.innerHTML = (dataLibrary.calendar[item].isLeap ? '闰' : '') + dataLibrary.calendar[item].lunarMonth + '月' + (functionLibrary.monthDays(dataLibrary.calendar[item].lunarYear, dataLibrary.calendar[item].lunarMonth) === 29 ? '小' : '大');
                        lunarDayObj.style.borderBottom = 'thin solid black';
                    } else {
                        lunarDayObj.innerHTML = functionLibrary.ChineseDay(dataLibrary.calendar[item].lunarDay);
                        lunarDayObj.style.borderBottom = '';
                    }
                    for (var j = 0; j < lunarFestival.length; j++) { // 农历节日
                        if (parseInt(lunarFestival[j].substr(0, 2)) === (dataLibrary.calendar[item].lunarMonth)) {
                            if (parseInt(lunarFestival[j].substr(2, 4)) === parseInt(dataLibrary.calendar[item].lunarDay)) {
                                lunarDayObj.innerHTML = lunarFestival[j].substr(5);
                                _lunarFestival = lunarFestival[j].substr(5);
                            }
                        }
                        if (12 === parseInt(dataLibrary.calendar[item].lunarMonth)) { // 判断是否为除夕
                            if (dataLibrary.monthPlusOne === parseInt(dataLibrary.calendar[item].lunarDay)) {
                                lunarDayObj.innerHTML = "除夕";
                                _lunarFestival = "除夕";
                            }
                        }
                    }
                    for (var _j = 0; _j < solarFestival.length; _j++) { // 阳历节日
                        if (parseInt(solarFestival[_j].substr(0, 2)) === SolarMonth + 1) {
                            if (parseInt(solarFestival[_j].substr(2, 4)) === item + 1) {
                                lunarDayObj.innerHTML = solarFestival[_j].substr(5);
                                _solarFestival = solarFestival[_j].substr(5);
                            }
                        }
                    }
                    if (SolarMonth + 1 === 5) { // 母亲节
                        if (dataLibrary.MothersDay === 0) {
                            if (item + 1 === 7) {
                                _solarFestival = "母亲节";
                                lunarDayObj.innerHTML = '<span style="color:green;">母亲节</span>';
                            }
                        } else if (dataLibrary.MothersDay < 9) {
                            if (item + 1 === 7 - dataLibrary.MothersDay + 8) {
                                _solarFestival = "母亲节";
                                lunarDayObj.innerHTML = '<span style="color:green;">母亲节</span>';
                            }
                        }
                    }
                    if (SolarMonth + 1 === 6) { // 父亲节
                        if (dataLibrary.FathersDay === 0) {
                            if (item + 1 === 14) {
                                _solarFestival = "父亲节";
                                lunarDayObj.innerHTML = '<span style="color:green;">父亲节</span>'
                            }
                        } else if (dataLibrary.FathersDay < 9) {
                            if (item + 1 === 7 - dataLibrary.FathersDay + 15) {
                                _solarFestival = "父亲节";
                                lunarDayObj.innerHTML = '<span style="color:green;">父亲节</span>'
                            }
                        }
                    }
                    if (solarFestival.length <= 0) { // 设置节气的颜色
                        solarFestival = dataLibrary.calendar[item].solarTerms;
                        if (solarFestival.length > 0) solarFestival = solarFestival.fontcolor('green');
                    }
                    if (solarFestival.length > 0) {
                        lunarDayObj.innerHTML = solarFestival;
                        _lunarFestival = solarFestival;
                    }
                    if (_lunarFestival !== null && _solarFestival !== null) {
                        lunarDayObj.innerHTML = _lunarFestival + "/" + _solarFestival;
                    }
                } else { // 不在当前日期表中显示
                    solarDayObj.innerHTML = '';
                    lunarDayObj.innerHTML = '';
                }
            }
        }
    }
    // 抛出层
    return {
        // 在下拉列表中选择年月时,调用自定义函数functionLibrary.calendarFestival(),显示阳历和农历的相关信息
        changeCalendar: function () {
            var year = myCalendar.SolarYear.selectedIndex + 1900;
            var month = myCalendar.SolarMonth.selectedIndex;
            functionLibrary.calendarFestival(year, month);
        },
        // 打开页时,在下拉列表中显示当前年月,并调用自定义函数functionLibrary.calendarFestival(),显示阳历和农历的相关信息
        initial: function () {
            myCalendar.SolarYear.selectedIndex = dataLibrary.todayYear - 1900;
            myCalendar.SolarMonth.selectedIndex = dataLibrary.todayMonth;
            functionLibrary.calendarFestival(dataLibrary.todayYear, dataLibrary.todayMonth);
        }
    }
})()


