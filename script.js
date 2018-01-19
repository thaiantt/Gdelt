let mySocket;

let colors = {
    1033: "salmon",
    333: "lightskyblue",
    233: "lightgreen",
    73: "orchid",
    1233: "palevioletred"
};

console.log(regionCode);

let modeBrush = false;
let modeBtn = document.getElementById("mode");
modeBtn.addEventListener("click", function() {
    modeBrush = !modeBrush;
    svg.selectAll("circle").remove();
    svg.selectAll(".selected").classed("selected", false);
    svg.selectAll(".activeReg").classed("activeReg", false);

    if (modeBrush) {
        modeBtn.innerHTML = "Switch to click";
        svg.append("g")
            .attr("class", "brush")
            .call(brush)
    } else {
        modeBtn.innerHTML = "Switch to brush";
        svg.select(".brush").remove();
    }

});

// MONTH SELECTION
let monthSelect = document.getElementById("monthSelect");
monthSelect.addEventListener("change", function () {
    month = this.value;
    console.log(month);
});
let month = monthSelect.value;
console.log(month);


// CALENDARS
let calendarStart = document.getElementById("start");
let startDate = calendarStart.value.replace(/-/g, "");
calendarStart.addEventListener("change", function () {
    let startVal = this.value.replace(/-/g, "");
    startDate = startVal;
    console.log("Change start calendar");
    console.log(startVal); //YYY-MM-DD
});

// let startDate = calendarStart.value;
// console.log(startDate);

let calendarEnd = document.getElementById("end");
let endDate = calendarEnd.value.replace(/-/g, "");
calendarEnd.addEventListener("change", function () {
    let endVal = this.value.replace(/-/g, "");
    endDate = endVal;
    console.log("Change end calendarr");
    console.log(endVal);
});
// let endDate = calendarEnd.value;
// console.log(endDate);

// RESULTS FROM API
window.addEventListener("load", function () {
    // Crée l'instance WebSocket
    mySocket = new WebSocket("ws://localhost:9000");
    // Ecoute pour les messages arrivant
    mySocket.onmessage = function (event) {
        // console.log(event.data);
        let res = JSON.parse(event.data);
        console.log(res);
        if (res["fct"] === "getAllHumanitarianEventsByRegionByYear") {
            addCircles(res["data"]);
        } else if (res["fct"] === "getAllHumanitarianEventsByRegionByMonthByYear") {
            addColoredCircles(res["data"], true);
        } else if (res["fct"] === "getDifferentEventsByRegionByYear") {
            addColoredCircles(res["data"], true);
        } else if (res["fct"] === "getDifferentEventsByRegionByMonthByYear") {
            addColoredCircles(res["data"], true);
        } else if (res["fct"] === "getCountDifferentEventsByCountryCodeByMonthByYear") {
            addInfoRegion(res["data"]);
        } else if (res["fct"] === "getEventByCountryCodeByStartByEnd") {
            addColoredCircles(res["data"], true);
        } else if (res["fct"] === "getCountDifferentEventsByCountryCodeByStartByEnd") {
            addInfoRegion(res["data"]);
        } else if (res["fct"] === "getEventsByBrushByStartByEnd") {
            addBrushedCircles(res["data"], true);
        }
    };
});

let t;
let s;
let active = d3.select(null);
// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 40};

let width = 1000,
    height = 600;
// height = 800;

let widthLegend = 200,
    heightLegend = 600;

let widthBarChart = 400,
    heightBarChart = 130;

// MAP
let brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start", clearBrushed)
    .on("end", brushed);

let svg = d3.select("#area1").append("svg");
// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .call(brush)
//     .on("mousedown touchstart", reset);

// svg.append("g")
//     .attr("class", "brush")
//     .call(brush);

// SVG
let svgBarChart = d3.select("#area2").append("svg");

let gBarChart = svgBarChart.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", widthBarChart + margin.left + margin.right)
//     .attr("height", heightBarChart + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + "," + margin.top + ")");


let projection = d3.geoMercator()
    .scale(width / 2 / Math.PI)
    //.scale(100)
    .translate([width / 2, height / 2]);

let path = d3.geoPath()
    .projection(projection);


let zoom = d3.zoom()
// no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
// .translate([0, 0])
// .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

let g = svg.append("g");

function clearBrushed() {
    console.log("kikoo ça clear");
    svg.selectAll(".brushedCircles")
        .remove();
}

function brushed() {
    console.log("kikoo ça brush");
    if(d3.event.selection) {
        let s = d3.event.selection,
            c0 = s[0], // Top lef
            c1 = s[1]; // Bottom right

        let coord0 = projection.invert(c0);
        let coord1 = projection.invert(c1);
        console.log(coord0, coord1);

        sendRequest('getEventsByBrushByStartByEnd', coord0, coord1, startDate, endDate)
    }
}

function sendRequest(name, ...args) {
    let msg = {
        "fct": name,
        "args": args
    };
    mySocket.send(JSON.stringify(msg));
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity);
}

function clicked(d, that) {
    let bbox = that.getBBox();

    if (active.node() === that) return reset();
    active.classed("active", false);
    active = d3.select(that).classed("active", true);

    let dx = bbox.width,
        dy = bbox.height,
        x = bbox.x + (bbox.width / 2),
        y = bbox.y + (bbox.height / 2),
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    t = translate;
    s = scale;

    svg.transition()
        .duration(750)
        // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    g.attr("transform", d3.event.transform); // updated for d3 v4
}

function showActive(that) {
    if (active.node() !== that) {
        active.classed("activeReg", false);
        active = d3.select(that).classed("activeReg", true);
    }
    svg.selectAll("circle")
        .remove();
}

function showOver(elem) {
    elem.classed("selected", true);
}

function showOut(elem) {
    elem.classed("selected", false);

    gBarChart.selectAll(".bar").remove();
    gBarChart.selectAll("g").remove();
}

// **************************************************
// *                Load map data                   *
// **************************************************
// EUROPE
d3.json('europe.geojson', function (error, geojson) {
    if (error) throw error;

    let europe = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(europe);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.europe, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.europe, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(europe);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select Europe");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "europe", 2017);
//             sendRequest("getDifferentEventsByRegionByMonthByYear", "europe", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "europe", startDate, endDate);
        })
    // .on("click", function (d) {
    //     clicked(d, this);
    //     console.log("Select Europe");
    //     sendRequest("getAllHumanitarianEventsByRegionByYear", "europe", 2017);
    // });

});


// AFRICA
d3.json('africa.geojson', function (error, geojson) {
    if (error) throw error;

    let africa = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(africa);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.africa, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.africa, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(africa);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select Africa");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "africa", 2017);
//             sendRequest("getDifferentEventsByRegionByMonthByYear", "africa", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "africa", startDate, endDate);
        })
    // .on("click", clicked);
});


// AMERICA
d3.json('north-america.geojson', function (error, geojson) {
    if (error) throw error;

    let northAmerica = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(northAmerica);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.northAmerica, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.northAmerica, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(northAmerica);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select NorthAmerica");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "northamerica", 2017);
//            sendRequest("getDifferentEventsByRegionByMonthByYear", "northamerica", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "northamerica", startDate, endDate);
        })
    // .on("click", clicked);
});

d3.json('south-america.geojson', function (error, geojson) {
    if (error) throw error;

    let southAmerica = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(southAmerica);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.southAmerica, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.southAmerica, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(southAmerica);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select SouthAmerica");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "southamerica", 2017);
//            sendRequest("getDifferentEventsByRegionByMonthByYear", "southamerica", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "southamerica", startDate, endDate);
        })
    // .on("click", clicked);
});


// OCEANIA
d3.json('oceania.geojson', function (error, geojson) {
    if (error) throw error;

    let oceania = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(oceania);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.oceania, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.oceania, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(oceania);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select Oceania");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "oceania", 2017);
//            sendRequest("getDifferentEventsByRegionByMonthByYear", "oceania", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "oceania", startDate, endDate);
        })
    // .on("click", clicked);
});


// ASIA
d3.json('asia.geojson', function (error, geojson) {
    if (error) throw error;

    let asia = g.append("path")
        .attr("d", path(geojson))
        .attr("class", "region")
        .on("mouseover", function (e) {
            showOver(asia);
        })
        .on("mouseenter", function (e) {
//            sendRequest("getCountDifferentEventsByCountryCodeByMonthByYear", regionCode.asia, month, "2017");
            sendRequest("getCountDifferentEventsByCountryCodeByStartByEnd", regionCode.asia, startDate, endDate);
        })
        .on("mouseout", function (e) {
            showOut(asia);
        })
        .on("mousedown touchstart", function (e) {
            showActive(this);
            console.log("Select Asia");
//            sendRequest("getAllHumanitarianEventsByRegionByYear", "asia", 2017);
//            sendRequest("getDifferentEventsByRegionByMonthByYear", "asia", month, "2017");
            sendRequest("getEventByCountryCodeByStartByEnd", "asia", startDate, endDate);
        })
    // .on("click", clicked);
});


// **************************************************
// *                INTERACTIONS                    *
// **************************************************
// add circles to svg

var radiusScale = d3.scaleLog()
    .domain([1, 5000])
    .range([1, 20]);

function addCircles(points, is_event) {
    console.log("Append new circles", points);
    // svg.selectAll("circle")
    //     .remove();

    svg.selectAll("circle")
        .data(points).enter()
        .append("circle")
        .attr("class", "events")
        .attr("cx", function (d) {
            return projection(d["_id"]["coordinates"])[0];
        })
        .attr("cy", function (d) {
            return projection(d["_id"]["coordinates"])[1];
        })
        .attr("r", function (d) {
            let rad = radiusScale(Math.min(10000, d["count"]))
            return rad + "px"
        });
}

function addColoredCircles(points, is_event) {
    console.log("Append new circles", points);
    // svg.selectAll("circle")
    //     .remove();

    svg.selectAll("circle")
        .data(points).enter()
        .append("circle")
        .attr("class", "events")
        .attr("cx", function (d) {
            return projection(d["_id"]["loc"]["coordinates"])[0];
        })
        .attr("cy", function (d) {
            return projection(d["_id"]["loc"]["coordinates"])[1];
        })
        .style("fill", function (d) {
            let color;
            if (is_event) {
                color = colors[d["_id"]["eventCode"]];
            } else {
                color = "red";
            }
            return color;
        })
        .transition("time")
        .delay(function (d, i) {
            return i;
        })
        .duration(function (d, i) {
            return (i + 1)
        })
        .attr("r", function (d) {
            let rad = radiusScale(Math.min(10000, d["count"]));
            return rad + "px"
        });
}

function addBrushedCircles(points, is_event) {

    svg.selectAll(".brushedCircles")
        .data(points).enter()
        .append("circle")
        .attr("class", "brushedCircles")
        .attr("cx", function (d) {
            return projection(d["_id"]["loc"]["coordinates"])[0];
        })
        .attr("cy", function (d) {
            return projection(d["_id"]["loc"]["coordinates"])[1];
        })
        .style("fill", function (d) {
            let color;
            if (is_event) {
                color = colors[d["_id"]["eventCode"]];
            } else {
                color = "red";
            }
            return color;
        })
        .transition("time")
        .delay(function (d, i) {
            return i;
        })
        .duration(function (d, i) {
            return (i + 1)
        })
        .attr("r", function (d) {
            let rad = radiusScale(Math.min(10000, d["count"]));
            return rad + "px"
        });
}

function addInfoRegion(data) {

    gBarChart.selectAll(".bar").remove();
    gBarChart.selectAll("g").remove();

    // set the ranges
    let x = d3.scaleLinear()
        .range([0, widthBarChart]);
    let y = d3.scaleBand()
        .range([heightBarChart, 0]);


    x.domain([0, d3.max(data, function (d) {
        return d["count"];
    })]);
    y.domain(data.map(function (d) {
        return d["_id"];
    })).padding(0.1);


    gBarChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightBarChart + ")")
        .call(d3.axisBottom(x));

    gBarChart.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    gBarChart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function (d) {
            return y(d["_id"]);
        })
        .attr("width", function (d) {
            return x(d["count"]);
        })
        .style("fill", function (d) {
            return colors[d["_id"]];
        });
}

