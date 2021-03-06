let mySocket;

let colors = {
    1033: "salmon",
    333: "lightskyblue",
    233: "lightgreen",
    73: "orchid",
    1223: "palevioletred"
};

let colorsLegend = [];

for (let k of Object.keys(colors)) {
    colorsLegend.push({
        key: k,
        val: colors[k]
    });
}

let nameLegends = {
    1033: "Demand humanitarian help",
    333: "Express intent to provide humanitarian aid",
    233: "Appeal for humanitarian aid",
    73: "Provide humanitarian aid",
    1223: "Reject request for humanitarian aid"
};

let radiusScale = d3.scaleLog()
    .domain([1, 5000])
    .range([1, 20]);

let dataCircle = [
    {size: 1, value: radiusScale.invert(1)},
    {size: 5, value: radiusScale.invert(5)},
    {size: 10, value: radiusScale.invert(10)},
    {size: 15, value: radiusScale.invert(15)},
    {size: 20, value: radiusScale.invert(20)}
];

function plotLegend(colorsLegend) {
    console.log(colorsLegend);
    let ref = 80;
    let svg = d3.select("#legend")
        .append("svg")
        .attr("height", 500);

    svg.append("text")
        .attr("class", "title")
        .attr("x", 120)
        .attr("y", 30)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .style("text-anchor", "middle")
        .text("Gdelt Analysis");

    svg.append("text")
        .attr("x", 1)
        .attr("y", ref - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .text("Legend");

    svg.selectAll(".legendColor")
        .data(colorsLegend).enter()
        .append("circle")
        .attr("class", "legendColor")
        .attr("cx", 5)
        .attr("cy", function (d, i) {
            return ref + 10 + i * 20;
        })
        .attr("r", 5)
        .style("fill", function (d) {
            console.log(d.val);
            return d.val;
        });

    svg.selectAll(".legendText")
        .data(colorsLegend).enter()
        .append("text")
        .attr("class", "legendText")
        .attr("x", 20)
        .attr("y", function (d, i) {
            return ref + 15 + i * 20;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .text(function (d, i) {
            return nameLegends[d.key]
        });

    svg.selectAll(".legendSize")
        .data(dataCircle).enter()
        .append("circle")
        .attr("class", "legendSize")
        .attr("cx", function (d, i) {
            return 15 + i * (30 + d.size);
        })
        .attr("cy", ref + 140)
        .attr("opacity", 0.3)
        .attr("r", function (d, i) {
            return d.size;
        });

    svg.selectAll(".legendSizeText")
        .data(dataCircle).enter()
        .append("text")
        .attr("class", "legendSizeText")
        .attr("x", function (d, i) {
            return 15 + i * (30 + d.size);
        })
        .attr("y", ref + 170)
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "middle")
        .text(function (d, i) {
            return Math.round(d.value);
        });


}


plotLegend(colorsLegend);


let modeBrush = false;
let modeBtn = document.getElementById("mode");
modeBtn.addEventListener("click", function () {
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
// let monthSelect = document.getElementById("monthSelect");
// monthSelect.addEventListener("change", function () {
//     month = this.value;
//     console.log(month);
// });
// let month = monthSelect.value;
// console.log(month);


// CALENDARS
let calendarStart = document.getElementById("start");
let startDate = calendarStart.value.replace(/-/g, "");
calendarStart.addEventListener("change", function () {
    let startVal = this.value.replace(/-/g, "");
    if (startVal) {
        startDate = startVal;
        console.log("Change start calendar");
        console.log(startVal); //YYY-MM-DD
        sendRequest("getCountAllByStartByEnd", startDate, endDate)
    }
});

// let startDate = calendarStart.value;
// console.log(startDate);

let calendarEnd = document.getElementById("end");
let endDate = calendarEnd.value.replace(/-/g, "");
calendarEnd.addEventListener("change", function () {
    let endVal = this.value.replace(/-/g, "");
    if (endVal) {
        endDate = endVal;
        console.log("Change end calendarr");
        console.log(endVal);
        sendRequest("getCountAllByStartByEnd", startDate, endDate)
    }
});
// let endDate = calendarEnd.value;
// console.log(endDate);

// RESULTS FROM API
window.addEventListener("load", function () {
    // Crée l'instance WebSocket
    let addr = window.location.href.replace("http://", "").replace(":8080/", "");
    mySocket = new WebSocket("ws://" + addr + ":9000");
    // mySocket = new WebSocket("ws://localhost:9000");
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
        } else if (res["fct"] === "getCountAllByStartByEnd") {
            addCount(res["data"]);
        } else if (res["fct"] === "getLinksByRegionByStartByEnd") {
            addHierarchicalEdgeBundling(res["data"]);
        } else if (res["fct"] === "getUndirectedLinksByRegionByStartByEnd") {
            addUndirectedHierarchicalEdgeBundling(res["data"]);
        }
    };
    mySocket.onopen = function () {
        sendRequest("getCountAllByStartByEnd", startDate, endDate)
    }

});

let t;
let s;
let active = d3.select(null);
// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 40};

let width = 1000,
    height = 600;
// height = 800;

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
let svgHierarchicalEdgeBundling = d3.select("#hierarchicalEdgeBundling").append("svg");

let gBarChart = svgBarChart.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
let gHierarchicalEdgeBundling  = svgHierarchicalEdgeBundling .append("g")
    .attr("transform", "translate(" + 200 + "," + 180 + ")");

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

let g = svg.append("g");

function clearBrushed() {
    console.log("kikoo ça clear");
    svg.selectAll(".brushedCircles")
        .remove();
}

function brushed() {
    console.log("kikoo ça brush");
    if (d3.event.selection) {
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

    gHierarchicalEdgeBundling.selectAll(".bar").remove();
    gHierarchicalEdgeBundling.selectAll("g").remove();
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.europe, startDate, endDate);
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.africa, startDate, endDate);
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.northAmerica, startDate, endDate);
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.southAmerica, startDate, endDate);
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.oceania, startDate, endDate);
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
            sendRequest("getUndirectedLinksByRegionByStartByEnd", regionCode.asia, startDate, endDate);
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
            let rad = radiusScale(Math.min(5000, d["count"]));
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
            let rad = radiusScale(Math.min(5000, d["count"]));
            return rad + "px"
        });
}

function addInfoRegion(data) {
    gBarChart.selectAll(".bar").remove();
    gBarChart.selectAll("g").remove();

    // set the ranges
    let x = d3.scaleLog()
        .range([0, widthBarChart]);
    let y = d3.scaleBand()
        .range([heightBarChart, 0]);

    x.domain([1, d3.max(data, function (d) {
        return d["count"];
    })]);
    y.domain(data.map(function (d) {
        return d["_id"];
    })).padding(0.1);


    gBarChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightBarChart + ")")
        .call(d3.axisBottom(x).ticks(5, ".1s"));

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

function addCount(number) {
    let count = document.getElementById("countNb");

    count.innerHTML = number;
}

function addHierarchicalEdgeBundling(result){
    gHierarchicalEdgeBundling.selectAll(".link").remove();
    gHierarchicalEdgeBundling.selectAll(".node").remove();

    let diameter = 350,
        radius = diameter / 2,
        innerRadius = radius - 80;

    let cluster = d3.cluster()
        .size([360, innerRadius]);

    let line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });


    let link = gHierarchicalEdgeBundling.append("g").selectAll(".link"),
        node = gHierarchicalEdgeBundling.append("g").selectAll(".node");

    let root = packageHierarchy(result)
        .sum(function(d) { return d.size; });

    cluster(root);

    link.data(packageImports(root.leaves()))
        .enter().append("path")
        .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
        .attr("class", "link")
        .attr("d", line);

    node.data(root.leaves())
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return regionCodeInvert[d.data.key]; });


    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(result) {
        let map = {};

        function find(name, data) {
            let node = map[name], i;
            if (!node) {
                node = map[name] = data || {name: name, children: []};
                if (name.length) {
                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                    node.parent.children.push(node);
                    node.key = name.substring(i + 1);
                }
            }
            return node;
        }

        result.forEach(function(d) {
            if (d["_id"]) {
                find(d["_id"], d);
            }
        });

        return d3.hierarchy(map[""]);
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        let map = {},
            imports = [];

        // Compute a map from name to node.
        nodes.forEach(function(d) {
            let filtered = d;
            filtered.data.actors2 = d.data.actors2.filter(actor => actor !== d.data._id && actor !== null);
            map[d.data._id] = filtered;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
            if (d.data.actors2){
                d.data.actors2.forEach(function(i) {
                    if(i) {
                        if (map[i]) {
                            imports.push(map[d.data._id].path(map[i]));
                        }
                    }
                });
            }
        });

        return imports;
    }

}

function addUndirectedHierarchicalEdgeBundling(result){
    gHierarchicalEdgeBundling.selectAll(".link").remove();
    gHierarchicalEdgeBundling.selectAll(".node").remove();

    let diameter = 350,
        radius = diameter / 2,
        innerRadius = radius - 80;

    let cluster = d3.cluster()
        .size([360, innerRadius]);

    let line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });


    let link = gHierarchicalEdgeBundling.append("g").selectAll(".link"),
        node = gHierarchicalEdgeBundling.append("g").selectAll(".node");

    let root = packageHierarchy(result)
        .sum(function(d) { return d.size; });

    cluster(root);

    link.data(packageImports(root.leaves()))
        .enter().append("path")
        .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
        .attr("class", "link")
        .attr("d", line);

    node.data(root.leaves())
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return regionCodeInvert[d.data.key];});


    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(result) {
        let map = {};

        function find(name, data) {
            let node = map[name], i;
            if (!node) {
                node = map[name] = data || {name: name, children: []};
                if (name.length) {
                    if (regionCodeInvert[name]) {
                        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                        node.parent.children.push(node);
                        node.key = name.substring(i + 1);
                    }
                }
            }
            return node;
        }

        result.forEach(function(d) {
            if (d._id) {
                find(d._id, d);
            }
        });

        return d3.hierarchy(map[""]);
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        let map = {},
            imports = [];

        // Compute a map from name to node.
        nodes.forEach(function(d) {
            let filtered = d;
            filtered.data.resp = d.data.resp.filter(actor => actor !== d.data._id && actor !== null);
            map[d.data._id] = filtered;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
            if (d.data.resp){
                d.data.resp.forEach(function(i) {
                    if (i){
                        if (map[i]) {
                            imports.push(map[d.data._id].path(map[i]));
                        }
                    }
                });
            }
        });

        return imports;
    }

}