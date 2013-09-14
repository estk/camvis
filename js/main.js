(function (globals) {
  
"use strict";

var rowHeight = 25;
var barHeight = rowHeight - 3;
var legendWidth = 200;
var axisHeight = 15;

var data = [];

var params = function() {
  var res = {};
  var q = document.URL.split('?')[1];
  if (! _.isUndefined(q)) {
    q = q.split('&');
    _.each(q, function (p) {
      p = p.split('=');
      res[p[0]] = p[1];
    });
  }
  return res;
}();

var worksheet = function () {
  switch (params.type) {
    case "full": return 1;
    case "small": return 2;
    case "micro": return 3;
    case "medium": return 4;
    default: return 1;
  }
}();

var ds = new Miso.Dataset({
  key: "0AvG1nt4wUltfdFZKUmlfSmxWaDdRQVVVaWlGN3hpZlE",
  worksheet: worksheet,
  importer: Miso.Dataset.Importers.GoogleSpreadsheet,
  parser: Miso.Dataset.Parsers.GoogleSpreadsheet
});


var error = function() {
  document.getElementById('chart').innerHTML = "Could not load data.";
};

function makeGraph () {
  var chartHeight = data.length*rowHeight;

  var containerWidth = $("#chart").width();
  var graphWidth = containerWidth - legendWidth;

  d3.selectAll('.chart svg').remove();

  var chart = d3.selectAll('.chart').append('svg')
    .attr('width', containerWidth)
    .attr('height', function () { return chartHeight + axisHeight; });

  var xScale = d3.scale.linear()
    .domain([0, ds.max("High")])
    .range([0, graphWidth]);

  chart.selectAll('g')
    .data(data)
  .enter()
    .append('g')
    .attr('transform', function (d,i) {
      return "translate(0," + i*rowHeight + ")";
    });

  chart.selectAll('g').append('rect')
    .attr('fill', function(d){ return d["Color"]; })
    .attr('height', barHeight)
    .attr('width', function(d) { return xScale(d["High"] - d["Low"]); })
    .attr('x', function(d){ return legendWidth + xScale(d["Low"]); })
    .attr('y', 2)

  // Labels
  chart.selectAll('g').append('text')
    .text(function(d) { return d["Manufacturer"] + " " + d["Model"] + " " + d["Size"]; })
    .attr('text-anchor', 'start')
    .attr('height', 25)
    .attr('x', 0)
    .attr('y', rowHeight)

  chart.selectAll('g').append('text')
    .text(function(d) { return d["Weight"]; })
    .attr('text-anchor', 'middle')
    .attr('height', 25)
    .attr('x', function (d) { return legendWidth + xScale( (d["High"] + d["Low"])/ 2) })
    .attr('y', 18)

    // Axes
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickSize(-chartHeight,0,0);

    chart.insert('g', ":first-child")
      .attr('transform', "translate(" + legendWidth + "," + chartHeight + ')')
      .call(xAxis);
};

var render = function () {
  this.each(function (row) { 
    if (row["Model"] !== null) 
      data.push(row); 
  });

  makeGraph();
};

ds.fetch({
  success: render,
  error: error
});

// Event Map
$(window).resize(makeGraph);
$("form").change(function () { this.submit();});

}(this));
