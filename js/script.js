function getDate(date) {
    return moment(date).format("MMM D YYYY");
}

function getTotalTime(array) {
    var totalMinutes = 0;
    var totalSeconds = 0;
    for (var i = 0; i < array.length; i++) {
        totalMinutes += array[i].minutes;
        totalSeconds += array[i].seconds;
    }
    return totalMinutes + (totalSeconds / 60);
}

function getDuration(minutes, seconds, totalTime) {
    var absoluteTime = minutes + (seconds / 60);
    return absoluteTime / totalTime;
}

function writeCandidateNumbers(id, debate, numCandidates) {
    $(id).append('<tr><td>' + debate + '</td><td>' + numCandidates + '</td></tr>');
}

function transformTalkingTimesData(data) {
    var transformed = [];
    var currentCandidates = ["Donald Trump", "John Kasich", "Ted Cruz", "Hillary Clinton", "Bernie Sanders"];
    for (var i = 0; i < data.length; i++) {
        var totalTalkingTime = getTotalTime(data[i].candidates);
        writeCandidateNumbers('#numCandidates' + data[i].party, data[i].date, data[i].numCandidates);
        for (var j = 0; j < data[i].candidates.length; j++) {
            if (currentCandidates.indexOf(data[i].candidates[j].name) >= 0) {
                var obj = {};
                obj.date = getDate(data[i].date);
                obj.numCandidates = data[i].numCandidates;
                obj.duration = data[i].duration;
                obj.moderator = data[i].moderator;
                obj.candidate = data[i].candidates[j].name;
                obj.talkingTime = getDuration(data[i].candidates[j].minutes, data[i].candidates[j].seconds, totalTalkingTime);
                transformed.push(obj);
            }
        }
    }
    return transformed;
}

function drawTalkingTimes(jsonfile, svgId) {
    var svg = dimple.newSvg(svgId, 1000, 500);
    d3.json(jsonfile, function(result) {
        var data = transformTalkingTimesData(result.data);
        var chart = new dimple.chart(svg, data);
        chart.addCategoryAxis('x', ['date', 'candidate', 'moderator']);
        chart.addMeasureAxis('y', 'talkingTime');
        var candidateSeries = chart.addSeries('candidate', dimple.plot.bar);
        var moderatorSeries = chart.addSeries('moderator');
        var candidateLegend = chart.addLegend(100, 10, 300, 50, 'right', candidateSeries);
        var moderatorLegend = chart.addLegend(500, 10, 300, 50, 'right', moderatorSeries);
        chart.draw();

        var moderatorFilters = dimple.getUniqueValues(data, 'moderator');
        chart.legends = [candidateLegend];
        moderatorLegend.shapes.selectAll('rect')
        .on('click', function(e) {
            var newFilters = [];
            var hide = false;
            moderatorFilters.forEach(function (f) {
                if (f === e.aggField.slice(-1)[0]) {
                    hide = true;
                } else {
                    newFilters.push(f);
                }
            });
            if (hide) {
                d3.select(this).style('opacity', 0.2);
            } else {
                newFilters.push(e.aggField.slice(-1)[0]);
                d3.select(this).style('opacity', 0.8);
            }
            moderatorFilters = newFilters;
            chart.data = dimple.filterData(data, 'moderator', moderatorFilters);
            chart.draw(800);
        });
    });
}

function normalizeScore(score) {
    return (score + 1) / 2;
}

function transformOverallData(data) {
    var transformed = [];
    for (var i = 0; i < data.length; i++) {
        for (var id in data[i]) {
            if (id !== 'date' && id !== 'src' && id !== 'party') {
                var op = {};
                op.candidate = id;
                var date = getDate(data[i].date);
                op.date = date;
                var scoreP = normalizeScore(data[i][id].score);
                op.score = scoreP;
                op.classification = data[i][id].classification;
                op.t = 'pos';
                transformed.push(op);
                var on = {};
                on.candidate = id;
                on.date = date;
                on.score = 1 - scoreP;
                on.classification = data[i][id].classification;
                on.t = 'neg';
                transformed.push(on);
            }
        }
    }
    return transformed;
}

function drawSentimentAnalysis(jsonfile, svgId, isV1) {
    var svg = dimple.newSvg(svgId, 650, 600);
    d3.json(jsonfile, function(result) {
        var data = transformOverallData(result);
        var chart = new dimple.chart(svg, data);
        if (isV1)
            chart.addCategoryAxis('x', ['candidate', 'date']);
        else
            chart.addCategoryAxis('x', ['date', 'candidate']);
        chart.addMeasureAxis('y', 'score');
        chart.addSeries('candidate', dimple.plot.bar);
        chart.addSeries('t', dimple.plot.bar);
        chart.addLegend(0, 10, 380, 20, 'right');
        chart.draw();
    });
}

function transformTopicData(data) {
    //addOptionsToDates("#debateDates" + data[i].party, data[i].date);
}

function addOptionsToDates(id, date) {
    $(id).append('<option value="' + date + '">' + getDate(date) + '</option>');
}

function drawTopicsAnalysis(jsonfile, svgId) {
    d3.select(svgId).selectAll("svg").remove();
    d3.json(jsonfile, function(result) {

    });
}

$(document).ready(function() {
    drawTalkingTimes('data/talkingtimes-rep.json', '#talkingTimeRep');
    drawTalkingTimes('data/talkingtimes-dem.json', '#talkingTimeDem');
    drawSentimentAnalysis('data/sentiments/rep_overall.json', '#sentimentRep1', true);
    drawSentimentAnalysis('data/sentiments/rep_overall.json', '#sentimentRep2', false);
    drawSentimentAnalysis('data/sentiments/dem_overall.json', '#sentimentDem1', true);
    drawSentimentAnalysis('data/sentiments/dem_overall.json', '#sentimentDem2', false);
});