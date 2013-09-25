
var rowHeight = 25;
var barHeight = rowHeight - 3;
var legendWidth = 200;
var axisHeight = 15;

var data = [];

// Get Params
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
console.log(params);

var colorMap = function (color) {
  var map = {
  gold:  "#b58900",
  orange:  "#cb4b16",
  red:  "#dc322f",
  magenta:  "#d33682",
  purple:  "#6c71c4",
  blue:  "#268bd2",
  cyan:  "#2aa198",
  green:  "#859900",
  gray: "#839496"
  };

  return map[color.toLowerCase()];
};

function makeGraph () {
  var max = _.max(data, function(d) { return d["High"]; })["High"];
  // var min = _(data).min(function(d) {return d["Low"]; });
  var chartHeight = data.length*rowHeight;

  var containerWidth = $("#chart").width();
  var graphWidth = containerWidth - legendWidth;

  d3.selectAll('.chart svg').remove();

  var chart = d3.selectAll('.chart').append('svg')
    .attr('width', containerWidth)
    .attr('height', function () { return chartHeight + axisHeight; });

  var xScale = d3.scale.linear()
    .domain([0, max])
    .range([0, graphWidth]);

  chart.selectAll('g')
    .data(data)
  .enter()
    .append('g')
    .attr('transform', function (d,i) {
      return "translate(0," + i*rowHeight + ")";
    });

  chart.selectAll('g').append('rect')
    .attr('fill', function(d){ return colorMap( d["Color"] ); })
    .attr('height', barHeight)
    .attr('width', function(d) { return xScale(d["High"] - d["Low"]); })
    .attr('x', function(d){ return legendWidth + xScale(d["Low"]); })
    .attr('y', 2)
    .attr('rx', 4)
    .attr('ry', 4);

  // Labels
  chart.selectAll('g').append('text')
    .text(function(d) { return d["Manufacturer"] + " " + d["Model"] + " " + d["Size"]; })
    .attr('text-anchor', 'start')
    .attr('height', 25)
    .attr('x', 0)
    .attr('y', rowHeight);

  chart.selectAll('g').append('text')
    .text(function(d) { return d["Weight"]; })
    .attr('text-anchor', 'middle')
    .attr('height', 25)
    .attr('x', function (d) { return legendWidth + xScale( (d["High"] + d["Low"])/ 2) })
    .attr('y', 18);

    // Axes
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickSize(-chartHeight,0,0);

    chart.insert('g', ":first-child")
      .attr('transform', "translate(" + legendWidth + "," + chartHeight + ')')
      .call(xAxis);
}
//---------------------//

var worksheets = [];
var promises = [];

_.each(params, function (v, k) {
  if (v) {
    worksheets.push(k);
    $('input[name=' + k + ']').attr('checked',true); 
  }
});


_.each(worksheets, function (w) {
  var dfd = new $.Deferred();
  var ds = new Miso.Dataset({
    key: "0AvG1nt4wUltfdFZKUmlfSmxWaDdRQVVVaWlGN3hpZlE",
    worksheet: w,
    importer: Miso.Dataset.Importers.GoogleSpreadsheet,
    parser: Miso.Dataset.Parsers.GoogleSpreadsheet
  });

  ds.fetch({
    success: function () { append(this).then(function() {dfd.resolve();}); },
    error: function () {dfd.fail(this); }
  });

  promises.push(dfd.promise());
  
});

$.when.apply($, promises)
  .then(function() {makeGraph();})
  .fail(error);


var append = function (a) {
  var dfd = new $.Deferred();
  var ds = this;
  a.each(function (row) { 
    if (row["Model"] !== null) 
      data.push(row);
  });
  dfd.resolve(data);;
  return dfd.promise();
}

var error = function() {
  document.getElementById('chart').innerHTML = "Could not load data.";
};



// Event Map
$(window).resize(function () {makeGraph()});
$("form").change(function () { this.submit();});

