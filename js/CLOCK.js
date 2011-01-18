/* JQuery */

// System constants

var maxRows = 16;
var maxCols = 16;
var maxRetry = 400;

// System variables

var clockFace = null;
var clockData = null;
var clockFail = false;

// Options and settings (may be restored from localStorage)

var upperCase = true;
var animated = false;
var highlight = false;
var fontFamily = "Helvetica";

var bgColor = "#617187";
var loColor = "#404040";
var hiColor = "#ffffff";
var msgColor = "#FFAAAA";
var dateColor = "#404040";

var clockWidth = 10;
var clockHeight = 10;
var showMinutes = false;
var showAMPM = false;
var userWords = [];
var showDate = "";

var MONTHS = [ "January", "February", "March", "April", "May",
               "June", "July", "August", "September", "October",
               "November", "December" ];

var DAYS   = [ "Sunday", "Monday", "Tuesday", "Wednesday",
               "Thursday", "Friday", "Saturday" ];

// ======================================================================

$(document).ready(function() {
    $('#submitSave').bind("click", saveSettings);
    $('#submitCancel').bind("click", cancelSettings);
    $('#fixSettings').bind("click", showSettings);

    loadSession();
    if (clockData == null) {
        makeNewFace();
    }

    if (clockFail) {
        failMessage();
    } else {
        createTable();
        formatTable();
        updateTime();
    }
});

// ======================================================================

function makeNewFace() {
    var count = 0;
    do {
        clockData = makeFace();
        count++;
    } while ((count < maxRetry) && (clockData == null));

    clockFail = (clockData == null);

    if (!clockFail) {
        storeFace();
    }
}

function failMessage() {
    $("body").css("background-color", "#ffffff");
    $("body").css("color", "#000000");
    $("#clock").css("display", "none");
    $("#fail").css("display","block");
}
// ======================================================================

function updateTime() {
    if (clockFail) {
        failMessage();
        return;
    }

    var date = new Date();
    // date = new Date(2011,1,17,23,15,0);
    showTime(date);
}

function showTime(date) {
    var row, col, pos;
    var time = Math.floor(date.getTime() / 1000);
    var nextchange = (time - (time % 300)) + 151;

    if (time > nextchange) {
        nextchange += 300;
    }

    var near5 = time - (time % 300);
    if (time - near5 > 150) {
        near5 += 300;
    }
    var date5 = date;
    date5.setTime(near5*1000);

    var hours = date5.getHours();
    var minutes = date5.getMinutes();

    var past = null;
    if (minutes > 30) {
        past = "to";
        minutes = 30 - (minutes - 30);
        hours++;
    } else if (minutes != 0) {
        past = "past";
    }

    var pm = (hours >= 12);

    if (hours == 0) {
        hours = 12;
    } else if (hours > 12) {
        hours -= 12;
    }

    var show = new Array();
    show.push({"word": "it", "count": 1, "class": "clock"})
    show.push({"word": "is", "count": 1, "class": "clock"})

    if (past != null) {
        // Does this clock use "pasto"?
        var pasto = false;
        for (pos = 0; !pasto && pos < clockData["words"].length; pos++) {
            pasto = (clockData["words"][pos][0] == "pasto"
                     && clockData["words"][pos][3] == "clock");
        }
        if (pasto) {
            if (past == "past") {
                show.push({"word": "pasto", "count": 1, "class": "clock", "start": 0, "end": 3})
            } else {
                show.push({"word": "pasto", "count": 1, "class": "clock", "start": 3, "end": 5})
            }
        } else {
            show.push({"word": past, "count": 1, "class": "clock"})
        }
    }

    if (minutes == 0) {
        show.push({"word": "oclock", "count": 1, "class": "clock"});
    } else if (minutes == 5) {
        show.push({"word": "five", "count": 1, "class": "clock"});
    } else if (minutes == 10) {
        show.push({"word": "ten", "count": 1, "class": "clock"});
    } else if (minutes == 15) {
        if (showMinutes) {
            show.push({"word": "fifteen", "count": 1, "class": "clock"})
        } else {
            // Does this clock use "a.quarter"?
            var aquarter = false;
            for (pos = 0; !aquarter && pos < clockData["words"].length; pos++) {
                aquarter = (clockData["words"][pos][0] == "a.quarter"
                            && clockData["words"][pos][3] == "clock");
            }
            if (aquarter) {
                show.push({"word": "a.quarter", "count": 1, "class": "clock"})
            } else {
                show.push({"word": "half", "count": 1, "class": "clock", "start": 1, "end": 1})
                show.push({"word": "quarter", "count": 1, "class": "clock"})
            }
        }
    } else if (minutes == 20) {
        show.push({"word": "twenty", "count": 1, "class": "clock"});
    } else if (minutes == 25) {
        show.push({"word": "twenty", "count": 1, "class": "clock"});
        show.push({"word": "five", "count": 1, "class": "clock"});
    } else if (minutes == 30) {
        // Does this clock use "thirty"?
        var thirty = false;
        for (pos = 0; !thirty && pos < clockData["words"].length; pos++) {
            thirty = (clockData["words"][pos][0] == "thirty"
                      && clockData["words"][pos][3] == "clock");
        }
        if (thirty) {
            show.push({"word": "thirty", "count": 1, "class": "clock"})
        } else {
            show.push({"word": "half", "count": 1, "class": "clock"})
        }
    }

    if (showMinutes) {
        show.push({"word": "minutes", "count": 1, "class": "clock"})
    }

    if (hours == 1) {
        show.push({"word": "one", "count": 1, "class": "clock"})
    } else if (hours == 2) {
        show.push({"word": "two", "count": 1, "class": "clock"})
    } else if (hours == 3) {
        show.push({"word": "three", "count": 1, "class": "clock"})
    } else if (hours == 4) {
        show.push({"word": "four", "count": 1, "class": "clock"})
    } else if (hours == 5) {
        show.push({"word": "five", "count": 2, "class": "clock"})
    } else if (hours == 6) {
        show.push({"word": "six", "count": 1, "class": "clock"})
    } else if (hours == 7) {
        show.push({"word": "seven", "count": 1, "class": "clock"})
    } else if (hours == 8) {
        show.push({"word": "eight", "count": 1, "class": "clock"})
    } else if (hours == 9) {
        show.push({"word": "nine", "count": 1, "class": "clock"})
    } else if (hours == 10) {
        show.push({"word": "ten", "count": 2, "class": "clock"})
    } else if (hours == 11) {
        show.push({"word": "eleven", "count": 1, "class": "clock"})
    } else if (hours == 12) {
        show.push({"word": "twelve", "count": 1, "class": "clock"})
    }

    if (showAMPM) {
        var ampm = pm ? "p" : "a";
        if (upperCase) {
            ampm = ampm.toUpperCase();
        }
        var patched = false;
        for (pos = 0; !patched && pos < clockData["words"].length; pos++) {
            if (clockData["words"][pos][0] == "am" && clockData["words"][pos][3] == "clock") {
                var cl = "r" + clockData["words"][pos][1] + "c" + clockData["words"][pos][2];
                $("#" + cl + " .l").html(ampm);
                patched = true;
            }
        }

        show.push({"word": "am", "count": 1, "class": "clock"})
    }

    if (showDate != "") {
        var datestr = showDate;
        datestr = datestr.replace("[YYYY]", ""+(date.getYear()+1900));
        datestr = datestr.replace("[YY]", ""+((date.getYear()+1900) % 100));

        var num = date.getMonth()+1;
        datestr = datestr.replace("[M]", num);
        datestr = datestr.replace("[0M]", num < 10 ? "0" + num : ""+num);
        datestr = datestr.replace("[MM]", num < 10 ? " " + num : ""+num);

        num = date.getDate();
        datestr = datestr.replace("[D]", num);
        datestr = datestr.replace("[0D]", num < 10 ? "0" + num : ""+num);
        datestr = datestr.replace("[DD]", num < 10 ? " " + num : ""+num);

        num = date.getDay();
        datestr = datestr.replace("[Dow]", DAYS[num]);
        datestr = datestr.replace("[DOW]", DAYS[num].toUpperCase());

        datestr = datestr.replace("[Month]", MONTHS[date.getMonth()]);
        datestr = datestr.replace("[MONTH]", MONTHS[date.getMonth()].toUpperCase());

        while (datestr.length < clockWidth) {
            datestr = " " + datestr;
        }

        for (var pos = 0; pos < datestr.length; pos++) {
            var cell = clockFace[clockHeight][pos];
            cell.css("background-color", bgColor);
            cell.css("color", dateColor);
            $("#" + cell.attr("id") + " .inv").css("color", bgColor);
            $("#" + cell.attr("id") + " .l").html(datestr.substring(pos,pos+1));
        }
    }

    if (animated) {
        $("#clock").everyTime(75, function(count) { toggleChar(show, count) }, (clockWidth*clockHeight)+1);
    } else {
        for (row = 0; row < clockHeight; row++) {
            for (col = 0; col < clockWidth; col++) {
                updateLetter(show,row,col);
            }
        }
    }

    // We update the display every five minutes, between each 5 minute interval
    $("body").oneTime((nextchange - time) * 1000, "update", updateTimer);
}

function updateTimer() {
    $("body").stopTime("update");
    updateTime();
}

function toggleChar(show, charnum) {
    var row = Math.floor(charnum / clockWidth);
    var col = charnum - (row * clockWidth);
    var cl = "r" + row + "c" + col;
    var cell = clockFace[row][col];

    var saveCh = $("#" + cl + " .l").html();
    var ch = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random()*26)];
    if (upperCase) {
        ch = ch.toUpperCase();
    }
    $("#" + cl + " .l").html(ch);
    setColor(row, col, hiColor);

    cell.oneTime(50, "patchletter", function() {
        $("#" + cl + " .l").html(saveCh);
        updateLetter(show, row, col);
    });
}

function updateLetter(show, row, col) {
    setColor(row, col, loColor);

    var info = letterInfo(row,col);

    if (info == null) {
        return;
    }

    if (info["class"] == "user") {
        if (highlight) {
            setColor(row, col, msgColor);
            cell.oneTime(500, "reset", function() { setColor(row, col, loColor); });
        }
        return;
    }

    // Weird special case for "a.quarter"
    if (info["word"].substring(info["char"],info["char"]+1) == ".") {
        return;
    }

    for (var pos = 0; pos < show.length; pos++) {
        if (show[pos]["word"] == info["word"]
            && show[pos]["count"] == info["count"]
            && show[pos]["class"] == info["class"]) {
            if (show[pos]["start"] == undefined) {
                setColor(row, col, hiColor);
            } else {
                if (show[pos]["start"] <= info["char"]
                    && show[pos]["end"] >= info["char"]) {
                    setColor(row, col, hiColor);
                }
            }
        }
    }
}

function letterInfo(row,col) {
    var words = clockData["words"];
    var counts = new Object();
    for (var pos = 0; pos < words.length; pos++) {
        var word = words[pos][0];
        var key = word + "+" + words[pos][3];

        if (counts[key] == undefined) {
            counts[key] = 1;
        } else {
            counts[key]++;
        }

        var wrow = words[pos][1];
        if (wrow > row) {
            return null;
        }
        var wcolstart = words[pos][2];
        var wcolend = wcolstart + word.length - 1;
        if (row == wrow && col >= wcolstart && col <= wcolend) {
            var wclass = words[pos][3];
            return { "word": word, "char": col-wcolstart, "class": wclass, "count": counts[key] };
        }
    }
}

function setColor(row, col, color) {
    var cl = "r" + row + "c" + col;
    var cell = clockFace[row][col];

    $("#" + cl + " .apos").css("color", color);
    cell.css("color", color);
}

// ======================================================================

function createTable() {
    $("#clock").html("");

    // Find "oclock"
    var pos = 0;
    while (pos < clockData["words"].length) {
        if (clockData["words"][pos][0] == "oclock"
            && clockData["words"][pos][3] == "clock") {
            break;
        }
        pos++;
    }

    var orow = clockData["words"][pos][1];
    var ocol = clockData["words"][pos][2];

    var clock = $("#clock");
    clockFace = new Array();
    for (var row = 0; row < maxRows; row++) {
        clockFace[row] = new Array();
        for (var col = 0; col < maxCols; col++) {
            var id = "r" + row + "c" + col;
            var div = document.createElement("div");
            clock.append($(div)[0]);
            cell = $(div);
            clockFace[row][col] = cell;

            var span = document.createElement("span");
            $(span).addClass("l");

            cell.append($(span)[0]);
            span = document.createElement("span");

            if (row == orow && col == ocol) {
                $(span).addClass("apos");
            } else {
                $(span).addClass("inv");
            }

            $(span).html("'");
            $(span).css("font-family", fontFamily);
            cell.append($(span)[0]);

            cell.attr("id", id);
            cell.css("display", "none");
            cell.css("margin", "0px");
            cell.css("padding", "0px");
            cell.css("font-family", fontFamily);
            cell.css("text-align" , "center");
        }
    }
}

function formatTable() {
    $("body").css("background-color", bgColor);
    $("body").css("color", loColor);

    $("#clock").css("display", "block");
    $("#fail").css("display","none");

    var headerSize = 0;
    var computeRows = clockHeight;
    if (showDate != "") {
        computeRows++;
    }

    var windowW = window.innerWidth
    var windowH = window.innerHeight

    var wSize = Math.floor(windowW / (clockWidth+1));
    var hSize = Math.floor((windowH - headerSize) / (computeRows+1));
    var size = Math.min(wSize,hSize);

    var fontSize = Math.floor(size * 0.75);

    var hofs = Math.floor((windowW - (clockWidth * size)) / 2);
    var vofs = Math.floor((windowH - (computeRows * size)) / 2);

    for (var row = 0; row <= clockHeight; row++) {
        for (var col = 0; col < clockWidth; col++) {
            var cell = clockFace[row][col];
            var id = cell.attr("id");
            var idx = (row*clockWidth) + col;

            var ch = clockData["clockface"].substring(idx, idx+1);
            if (upperCase) {
                ch = ch.toUpperCase();
            }

            var showCell = row < clockHeight;
            if (showDate != "" && row == clockHeight) {
                showCell = true;
                ch = " ";
            }

            if (showCell) {
                cell.unbind();
                cell.bind("click", showSettings);

                cell.css("background-color", bgColor);
                cell.css("color", loColor);
                cell.css("display", "block");
                cell.css("position" , "absolute");
                cell.css("width" , "" + size + "px");
                cell.css("height" , "" + size + "px");
                cell.css("left", "" + ((col * size)+hofs) + "px");
                cell.css("top", "" + ((row * size)+vofs+headerSize) + "px");
                cell.css("font-size", "" + fontSize + "px");

                $("#" + id + " .l").html(ch);
                $("#" + id + " .inv").css("color", bgColor);
            } else {
                cell.css("display", "none");
            }
        }
    }
}

// ============================================================

function makeFace() {
    var words = chooseWords();
    var lines = new Array();
    var line = new Array();
    var width = 0;
    for (var pos = 0; pos < words.length; pos++) {
        var word = words[pos][0];

        if (word == "minutes") {
            if (line.length == 0) {
                word = "minutes.";
            } else {
                word = ".minutes";
            }
        }

        if (word == "pasto") {
            if (line.length == 0) {
                word = "pasto.";
            } else {
                word = ".pasto.";
            }
        }

        if (word == "past") {
            if (words[pos-1][0] != "to" && line.length != 0) {
                word = ".past";
            }
            if (words[pos+1][0] != "to") {
                word = "past.";
            }
        }

        if (word == "to") {
            if (words[pos-1][0] != "past" && line.length != 0) {
                word = ".to";
            }
            if (words[pos+1][0] != "past") {
                word = "to.";
            }
        }

        if (width + word.length <= clockWidth) {
            line.push([word,words[pos][1]]);
            width += word.length;
        } else {
            lines.push(line);
            line = new Array();

            // On a new line, we don't need a dot in front the word
            if (word.substring(0,1) == ".") {
                word = word.substring(1);
            }

            // But we do need a dot after "minutes"
            if (word == "minutes") {
                word = "minutes.";
            }

            line.push([word,words[pos][1]]);
            width = word.length;
        }
    }
    lines.push(line);

    while (lines.length < clockHeight) {
        line = new Array();
        lines.push(line);
    }

    if (lines.length > clockHeight) {
        return null;
    }

    var face = "";
    var row, col, width, chars, blanks, spotnum, spots, pos, wpos;
    var result = new Object();
    result["words"] = new Array();
    var wcount = 0;

    for (row = 0; row < lines.length; row++) {
        var lwords = lines[row];

        width = 0;
        for (wpos = 0; wpos < lwords.length; wpos++) {
            width += lwords[wpos][0].length;
        }
        chars = clockWidth - width;
        spots = lwords.length - 1 + 2;

        blanks = new Array();
        for (spotnum = 0; spotnum < spots; spotnum++) {
            blanks[spotnum] = 0;
        }
        while (chars > 0) {
            for (spotnum = 0; spotnum < spots && chars > 0; spotnum++) {
                if (Math.random() < 0.2) {
                    blanks[spotnum]++;
                    chars--;
                }
            }
        }

        col = 0;
        var line = "";
        for (wpos = 0; wpos < lwords.length; wpos++) {
            for (pos = 0; pos < blanks[wpos]; pos++) {
                line += ".";
                col++;
            }

            // Now hack off the leading and trailing dots, if there are any
            var wcol = col;
            var word = lwords[wpos][0];
            if (word.substring(0,1) == ".") {
                wcol++;
                word = word.substring(1);
            }
            if (word.substring(word.length-1) == ".") {
                word = word.substring(0, word.length-1);
            }

            result["words"][wcount++] = [word, row, wcol, lwords[wpos][1]];

            line += lwords[wpos][0];
            col += lwords[wpos][0].length;
        }
        while (line.length < clockWidth) {
            line += ".";
        }

        face += line;
    }

    for (pos = 0; pos < face.length; pos++) {
        var ch = face.substring(pos,pos+1);
        if (ch == ".") {
            ch = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random()*26)];
            face = face.substring(0,pos) + ch + face.substring(pos+1);
        }
    }

    result["clockface"] = face;

    $("#clockface").html(face);

    return result;

}

function chooseWords() {
    var wordLists = [ ["it.", "is."],
                      ["quarter", "half", "ten", "twenty", "five"],
                      ["past", "to"],
                      ["one","two","three","four","five","six",
                       "seven","eight","nine","ten","eleven","twelve"],
                      [".oclock"] ];

    var words = new Array();

    if (Math.random() > 0.5) {
        wordLists[2] = ["pasto"];
    }

    // Make sure five comes after twenty.
    var done = false;
    while (!done) {
        shuffleInPlace(wordLists[1]);
        var seenTwenty = false;
        for (var pos = 0; pos < wordLists[1].length; pos++) {
            seenTwenty = seenTwenty || (wordLists[1][pos] == "twenty");
            done = done || (seenTwenty && wordLists[1][pos] == "five");
        }
    }

    shuffleInPlace(wordLists[2]);
    shuffleInPlace(wordLists[3]);

    var seenHalf = false;

    for (var list = 0; list < wordLists.length; list++) {
        for (var pos = 0; pos < wordLists[list].length; pos++) {
            var word = wordLists[list][pos];
            if (word == "half") {
                if (showMinutes) {
                    word = "thirty";
                } else {
                    seenHalf = true;
                }
            }

            if (word == "quarter" && !seenHalf) {
                word = "a.quarter";
            }

            if (showMinutes && (word == "quarter" || word == "a.quarter")) {
                word = "fifteen";
            }

            words.push([word, "clock"])
        }

        if (showMinutes && list == 1) {
            words.push(["minutes", "clock"]);
        }
    }

    if (showAMPM) {
        words.push([".am", "clock"]);
    }

    if (userWords.length > 0) {
        var chunk = Math.floor(words.length / userWords.length);
        for (var pos = 0; pos < userWords.length; pos++) {
            var wpos = Math.floor(Math.random() * chunk) + (pos * chunk);
            words.splice(wpos, 0, [userWords[pos]+".","user"]);
        }
    }

    return words;
}

function shuffleInPlace(anArray) {
    // Fisher-Yates
    var len = anArray.length;
    if (len == 0) {
        return false;
    }

    while ( --len ) {
        var idx = Math.floor( Math.random() * ( len + 1 ) );
        var temp1 = anArray[len];
        var temp2 = anArray[idx];
        anArray[len] = temp2;
        anArray[idx] = temp1;
    }
}

// ============================================================

function showSettings() {
    $("#upperCase").attr("checked", upperCase);
    $("#showMinutes").attr("checked", showMinutes);
    $("#animated").attr("checked", animated);
    $("#highlight").attr("checked", highlight);
    $("#showAMPM").attr("checked", showAMPM);

    $("#bgColor").val(bgColor.substring(1));
    $("#hiColor").val(hiColor.substring(1));
    $("#loColor").val(loColor.substring(1));
    $("#msgColor").val(msgColor.substring(1));
    $("#dateColor").val(dateColor.substring(1));

    updateColors();

    $("#bgColor").unbind();
    $("#hiColor").unbind();
    $("#loColor").unbind();
    $("#msgColor").unbind();
    $("#dateColor").unbind();

    $("#bgColor").bind("change",updateColors);
    $("#hiColor").bind("change",updateColors);
    $("#loColor").bind("change",updateColors);
    $("#msgColor").bind("change",updateColors);
    $("#dateColor").bind("change",updateColors);

    $("#showDate").val(showDate);
    $("#fontFamily").val(fontFamily);

    for (var pos = 0; pos < 12; pos++) {
        $("#month"+pos).val(MONTHS[pos]);
    }

    for (var pos = 0; pos < 7; pos++) {
        $("#day"+pos).val(DAYS[pos]);
    }

    var curMessage = "";
    for (var pos = 0; pos < userWords.length; pos++) {
        if (curMessage.length > 0) {
            curMessage += " ";
        }
        curMessage += userWords[pos];
    }
    $("#userWords").val(curMessage);

    $("#clockWidth option").each(function() {
        $(this).attr("selected", "");
        if ($(this).val() == clockWidth) {
            $(this).attr("selected", "selected");
        }
    });

    $("#clockHeight option").each(function() {
        $(this).attr("selected", "");
        if ($(this).val() == clockHeight) {
            $(this).attr("selected", "selected");
        }
    });

    $("body").css("background-color", bgColor);
    $("body").css("color", hiColor);

    $("#settings").css("display", "block");
    $("#main").css("display", "none");
    $("#fail").css("display", "none");

    return false;
}

function updateColors() {
    var bg = "#" + $("#bgColor").val();
    var hi = "#" + $("#hiColor").val();
    var lo = "#" + $("#loColor").val();
    var msg = "#" + $("#msgColor").val();
    var date = "#" + $("#dateColor").val();

    var re = "#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]?[0-9a-fA-F]?[0-9a-fA-F]?";

    if (bg != bg.match(re)) {
        bg = bgColor;
        $("#bgColor").val(bgColor.substring(1));
    }

    if (hi != hi.match(re)) {
        hi = hiColor;
        $("#hiColor").val(hiColor.substring(1));
    }

    if (lo != lo.match(re)) {
        lo = loColor;
        $("#loColor").val(loColor.substring(1));
    }

    if (msg != msg.match(re)) {
        msg = msgColor;
        $("#msgColor").val(msgColor.substring(1));
    }

    if (date != date.match(re)) {
        date = dateColor;
        $("#dateColor").val(dateColor.substring(1));
    }

    $("#bgColor").css("background-color", bg);
    $("#bgColor").css("color", hi);
    $("#hiColor").css("background-color", bg);
    $("#hiColor").css("color", hi);
    $("#loColor").css("background-color", bg);
    $("#loColor").css("color", lo);
    $("#msgColor").css("background-color", bg);
    $("#msgColor").css("color", msg);
    $("#dateColor").css("background-color", bg);
    $("#dateColor").css("color", date);

    $("#bgColorTxt").css("background-color", bg);
    $("#bgColorTxt").css("color", hi);
    $("#hiColorTxt").css("background-color", bg);
    $("#hiColorTxt").css("color", hi);
    $("#loColorTxt").css("background-color", bg);
    $("#loColorTxt").css("color", lo);
    $("#msgColorTxt").css("background-color", bg);
    $("#msgColorTxt").css("color", msg);
    $("#dateColorTxt").css("background-color", bg);
    $("#dateColorTxt").css("color", date);
}

function saveSettings() {
    var curCase = upperCase;
    var curFont = fontFamily;
    var curMinutes = showMinutes;
    var curAMPM = showAMPM;
    var curWidth = clockWidth;
    var curHeight = clockHeight;
    var rebuild = $("#forceRebuild").attr("checked");

    $("#forceRebuild").attr("checked",false);

    var curMessage = "";
    for (var pos = 0; pos < userWords.length; pos++) {
        if (curMessage.length > 0) {
            curMessage += " ";
        }
        curMessage += userWords[pos];
    }

    upperCase = $("#upperCase").attr("checked");
    showMinutes = $("#showMinutes").attr("checked");
    showAMPM = $("#showAMPM").attr("checked");
    animated = $("#animated").attr("checked");
    highlight = $("#highlight").attr("checked");

    rebuild = rebuild || (showDate != $("#showDate").val());
    showDate = $("#showDate").val();
    fontFamily = $("#fontFamily").val();

    for (var pos = 0; pos < 12; pos++) {
        rebuild = rebuild || (MONTHS[pos] != $("#month"+pos).val());
        MONTHS[pos] = $("#month"+pos).val();
    }

    for (var pos = 0; pos < 7; pos++) {
        rebuild = rebuild || (DAYS[pos] != $("#day"+pos).val());
        DAYS[pos] = $("#day"+pos).val();
    }

    var newMessage = $("#userWords").val();
    if (newMessage != curMessage) {
        userWords = newMessage.split(" ");
        rebuild = true;
    }

    $("#clockWidth option").each(function() {
        if ($(this).attr("selected")) {
            clockWidth = parseInt($(this).val());
        }
    });

    $("#clockHeight option").each(function() {
        if ($(this).attr("selected")) {
            clockHeight = parseInt($(this).val());
        }
    });

    rebuild = rebuild || (curWidth != clockWidth || curHeight != clockHeight);
    rebuild = rebuild || (curMinutes != showMinutes) || (curAMPM != showAMPM);

    var bgCurrent = bgColor;
    var loCurrent = loColor;
    var dateCurrent = dateColor;

    bgColor = "#" + $("#bgColor").val();
    hiColor = "#" + $("#hiColor").val();
    loColor = "#" + $("#loColor").val();
    msgColor = "#" + $("#msgColor").val();
    dateColor = "#" + $("#dateColor").val();

    if (!rebuild && ((curCase != upperCase) || (curFont != fontFamily))) {
        for (var row = 0; row < maxRows; row++) {
            for (var col = 0; col < maxCols; col++) {
                var cell = clockFace[row][col];
                var id = cell.attr("id");
                var letter = $("#" + id + " .l");
                var ch = letter.html().toUpperCase();
                if (!upperCase) {
                    ch = ch.toLowerCase();
                }
                letter.html(ch);
                letter.css("font-family", fontFamily);
                $("#" + id + " .apos").css("font-family", fontFamily);
            }
        }
    }

    if (rebuild) {
        makeNewFace();
        if (!clockFail) {
            createTable();
            formatTable();
        }
    }

    $("#settings").css("display", "none");
    $("#main").css("display", "block");

    // FIXME: Also reset font family

    if (bgColor != bgCurrent || loColor != loCurrent || dateColor != dateCurrent) {
        $("body").css("background-color", bgColor);
        $("body").css("color", loColor);
        for (var row = 0; row < clockHeight; row++) {
            for (var col = 0; col < clockWidth; col++) {
                var cell = clockFace[row][col];
                cell.css("background-color", bgColor);
                cell.css("color", loColor);
                $("#" + cell.attr("id") + " .inv").css("color", bgColor);
            }
        }

        if (showDate != "") {
            for (var col = 0; col < clockWidth; col++) {
                var cell = clockFace[clockHeight][col];
                cell.css("background-color", bgColor);
                cell.css("color", dateColor);
                $("#" + cell.attr("id") + " .inv").css("color", bgColor);
            }
        }
    }

    if (!clockFail) {
        storeSession();
    }

    updateTime();
}

function cancelSettings() {
    $("#settings").css("display", "none");
    $("#main").css("display", "block");
    updateTime();
}

// ======================================================================

function storeFace() {
    localStorage.setItem("clockWidth", clockWidth);
    localStorage.setItem("clockHeight", clockHeight);
    localStorage.setItem("clockData[clockface]", clockData["clockface"]);
    localStorage.setItem("clockData[words][length]", clockData["words"].length);
    for (var pos = 0; pos < clockData["words"].length; pos++) {
        for (var cpos = 0; cpos < clockData["words"][pos].length; cpos++) {
            var key = "clockData[words][" + pos + "][" + cpos + "]";
            localStorage.setItem(key, clockData["words"][pos][cpos]);
        }
    }
}

function loadFace() {
    var face = localStorage.getItem("clockData[clockface]");
    if (face == null) {
        return;
    }

    clockWidth = parseInt(localStorage.getItem("clockWidth"));
    clockHeight = parseInt(localStorage.getItem("clockHeight"));

    clockData = new Object();
    clockData["clockface"] = face;
    clockData["words"] = new Array();

    var wlen = parseInt(localStorage.getItem("clockData[words][length]"));
    for (var pos = 0; pos < wlen; pos++) {
        var data = new Array();
        for (var cpos = 0; cpos < 4; cpos++) {
            var key = "clockData[words][" + pos + "][" + cpos + "]";
            var val = localStorage.getItem(key);
            // FIXME: Hack
            if (cpos == 1 || cpos == 2) {
                val = parseInt(val);
            }
            data.push(val);
        }
        clockData["words"].push(data);
    }
}

function storeSession() {
    var pos;
    var key;

    localStorage.setItem("upperCase", upperCase);
    localStorage.setItem("animated", animated);
    localStorage.setItem("highlight", highlight);
    localStorage.setItem("fontFamily", fontFamily);

    localStorage.setItem("bgColor", bgColor);
    localStorage.setItem("loColor", loColor);
    localStorage.setItem("hiColor", hiColor);
    localStorage.setItem("msgColor", msgColor);
    localStorage.setItem("dateColor", dateColor);
    localStorage.setItem("fontFamily", fontFamily);

    localStorage.setItem("clockWidth", clockWidth);
    localStorage.setItem("clockHeight", clockHeight);
    localStorage.setItem("showMinutes", showMinutes);
    localStorage.setItem("showAMPM", showAMPM);

    for (pos = 0; pos < userWords.length; pos++) {
        key = "userWords[" + pos + "]";
        localStorage.setItem(key, userWords[pos]);
    }

    localStorage.setItem("showDate", showDate);

    for (pos = 0; pos < MONTHS.length; pos++) {
        key = "MONTHS[" + pos + "]";
        localStorage.setItem(key, MONTHS[pos]);
    }

    for (pos = 0; pos < DAYS.length; pos++) {
        key = "DAYS[" + pos + "]";
        localStorage.setItem(key, DAYS[pos]);
    }

    storeFace();
}

function loadSession() {
    upperCase = lsBoolean("upperCase", upperCase);
    animated = lsBoolean("animated", animated);
    highlight = lsBoolean("highlight", highlight);
    fontFamily = lsString("fontFamily", fontFamily);

    bgColor = lsString("bgColor", bgColor);
    loColor = lsString("loColor", loColor);
    hiColor = lsString("hiColor", hiColor);
    msgColor = lsString("msgColor", msgColor);
    dateColor = lsString("dateColor", dateColor);
    fontFamily = lsString("fontFamily", fontFamily);

    clockWidth = lsInteger("clockWidth", clockWidth);
    clockHeight = lsInteger("clockHeight", clockHeight);
    showMinutes = lsBoolean("showMinutes", showMinutes);
    showAMPM = lsBoolean("showAMPM", showAMPM);

    userWords = new Array();
    var pos = 0;
    var key = "userWords[" + pos + "]";
    while (localStorage.getItem(key) != null) {
        userWords[pos] = localStorage.getItem(key);
        pos++;
        key = "userWords[" + pos + "]";
    }

    showDate = lsString("showDate", showDate);

    pos = 0;
    key = "MONTHS[" + pos + "]";
    while (localStorage.getItem(key) != null) {
        MONTHS[pos] = localStorage.getItem(key);
        pos++;
        key = "MONTHS[" + pos + "]";
    }

    pos = 0;
    key = "DAYS[" + pos + "]";
    while (localStorage.getItem(key) != null) {
        DAYS[pos] = localStorage.getItem(key);
        pos++;
        key = "DAYS[" + pos + "]";
    }

    loadFace();
}

function lsBoolean(name, defval) {
    var val = localStorage.getItem(name);
    if (val == null) {
        return defval;
    } else {
        return (val == "true");
    }
}

function lsInteger(name, defval) {
    var val = localStorage.getItem(name);
    if (val == null) {
        return defval;
    } else {
        return parseInt(val);
    }
}

function lsString(name, defval) {
    var val = localStorage.getItem(name);
    if (val == null) {
        return defval;
    } else {
        return val;
    }
}
