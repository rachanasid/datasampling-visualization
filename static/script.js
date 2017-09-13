var path = '../static/data/';
var svg_margin = {top: 50, right: 20, bottom: 50, left: 70};

function display_samples(value, csv){
  var numOfTicks = 10;
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.Purchase = +d.Purchase;
      d.WeekofPurchase = +d.WeekofPurchase;
      d.PriceCH = +d.PriceCH;
      d.PriceMM = +d.TotalPrice;
      d.WeekofPurchase = +d.WeekofPurchase;
      d.PriceCH = +d.PriceCH;
      d.PriceMM = +d.PriceMM;
      d.DiscCH = +d.DiscCH;
      d.DiscMM = +d.DiscMM;
      d.SpecialCH = +d.SpecialCH;
      d.SpecialMM = +d.SpecialMM;
      d.LoyalCH = +d.LoyalCH;
      d.SalePriceMM = +d.SalePriceMM;
      d.SalePriceCH = +d.SalePriceCH;
      d.PriceDiff = +d.PriceDiff;
      d.Store7 = +d.Store7;
      d.PctDiscMM = +d.PctDiscMM;
      d.PctDiscCH = +d.PctDiscCH;
      d.ListPriceDiff = +d.ListPriceDiff;
      d.STORE = +d.STORE;
    });

    var data_selected = [],
        data_length = data.length;
    for (i = 0; i < data_length; i++) {
      data_selected[i] = data[i][value];
    }

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = Math.max(...data_selected)*1.05,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
        .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleLinear()
        .domain([lower_limit, upper_limit])
        .rangeRound([0, width]);

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(numOfTicks))
        (data_selected);

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    var bars = container.selectAll(".bar")
        .data(bins)
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .on("mouseover", function(d) {
             d3.select(this).append("text")
              .attr("y", function(d) { return -2-0.05*(height - y(d.length)); })
              .attr("x", (x(d.x1) - x(d.x0))/2 - 2)
              .attr("text-anchor", "middle")
              .text(d.length)
              .style("fill", "#FF8C00");
          })
          .on("mouseout", function(d) {
            d3.select(this).select("text").remove();
          });

    bars.append("rect")
      .attr("x", 1)
      .attr("width", function(d) { return x(d.x1) - x(d.x0) - 2; })
      .attr("height", function(d) { return height - y(d.length); })
      .on("mouseover", function(d) {
        d3.select(this).transition()
          .attr("x", 0)
          .attr("width", function(d) { return 1.03*(x(d.x1) - x(d.x0) - 2); })
          .attr("y", function(d) { return -0.05*(height - y(d.length)); })
          .attr("height", function(d) { return 1.05*(height - y(d.length)); })
          .style("fill", "#008000");
      })
      .on("mouseout", function(d) {
        d3.select(this).transition()
          .attr("x", 1)
          .attr("width", function(d) { return x(d.x1) - x(d.x0) - 2; })
          .attr("y", 0)
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#412F87");
      });

    container.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(numOfTicks));

    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text(value);

    container.append("g")
      .call(d3.axisLeft(y));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Count");
  });
}

function display_scree_plot(csv){
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;
    data.forEach(function(d) {
        d.PCA_Component = +d.PCA_Component;
        d.Eigen_values = +d.Eigen_values;
    });

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = 17,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
                    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleLinear()
        .domain([lower_limit, upper_limit])
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var valueline = d3.line()
      .x(function(d) { return x(d.PCA_Component); })
      .y(function(d) { return y(d.Eigen_values); });

    x.domain([0, d3.max(data, function(d) { return d.PCA_Component; })]);
    y.domain([0, d3.max(data, function(d) { return d.Eigen_values; })]);

    container.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    container.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.PCA_Component); })
        .attr("cy", function(d) { return y(d.Eigen_values); });

    container.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text('Component');

    container.append("g")
        .call(d3.axisLeft(y));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Eigen Value");

    container.append("text")
      .attr("transform", "translate(" + (width - 200) + " ," + (height - 125) + ")")
      .style("text-anchor", "middle")
      .text('Intrinsic Dimensionality = 6');

    container.append("line")
      .style("stroke-dasharray", ("10,3"))
      .style("stroke", "black")
      .attr("x1", 0)
      .attr("y1", height - 112)
      .attr("x2", width - 48)
      .attr("y2", height - 112);

  });
}

function display_elbow_plot(csv){
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;
    data.forEach(function(d) {
        d.Objective_function = +d.Objective_function;
        d.K = +d.K;
    });

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = 17,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
                    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleLinear()
        .domain([lower_limit, upper_limit])
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var valueline = d3.line()
      .x(function(d) { return x(d.K); })
      .y(function(d) { return y(d.Objective_function); });

    x.domain([0, d3.max(data, function(d) { return d.K; })]);
    y.domain([0, d3.max(data, function(d) { return d.Objective_function; })]);

    container.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    container.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.K); })
        .attr("cy", function(d) { return y(d.Objective_function); });

    container.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text('K');

    container.append("g")
        .call(d3.axisLeft(y));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Objective function");

    container.append("text")
      .attr("transform", "translate(" + (width - 200) + " ," + (height - 225) + ")")
      .style("text-anchor", "middle")
      .text('K = 3');
  });
}

function display_squared_loadings(csv){
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.Squared_loadings = +d.Squared_loadings;
    });

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = 17,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
                    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(data.map(function(d) { return d.Attributes; }));
    y.domain([0, d3.max(data, function(d) { return d.Squared_loadings; })]);

    container.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Attributes); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.Squared_loadings); })
        .attr("height", function(d) { return height - y(d.Squared_loadings); })
        .on("mouseover", function() {
          d3.select(this).transition()
            .style("fill", "#008000");
        })
        .on("mouseout", function(d) {
          d3.select(this).transition()
            	.style("fill", "#412F87");
        });

    container.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text("Attributes");

    container.append("g")
        .call(d3.axisLeft(y));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Squared Loading");
  });
}

function display_pca_scatter(csv) {
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.pca1 = +d.pca1;
      d.pca2 = +d.pca2;
    });

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = 17,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
                    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, function(d) { return d.pca1; }),d3.max(data, function(d) { return d.pca1; })]);

    var y = d3.scaleLinear()
        .range([0, height])
        .domain([d3.min(data, function(d) { return d.pca2; }),d3.max(data, function(d) { return d.pca2; })]);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    container.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.pca1); })
        .attr("cy", function(d) { return y(d.pca2); })
        .style("fill", function(d) { return colors(d.pca1); });
    container.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text("Principal Component 1");
    container.append("g")
      .call(d3.axisLeft(y));
    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Principal Component 2");
  });
}

function display_mds(csv){
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.mds1 = +d.mds1;
      d.mds2 = +d.mds2;
    });

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var lower_limit = 0,
        upper_limit = 17,
        width = +svg.attr("width") - svg_margin.left - svg_margin.right,
        height = +svg.attr("height") - svg_margin.top - svg_margin.bottom;

    var container = svg.append("g")
                    .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")");

    var x = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, function(d) { return d.mds1; }),d3.max(data, function(d) { return d.mds1; })]);

    var y = d3.scaleLinear()
        .range([0, height])
        .domain([d3.min(data, function(d) { return d.mds2; }),d3.max(data, function(d) { return d.mds2; })]);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    container.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.mds1); })
        .attr("cy", function(d) { return y(d.mds2); })
        .style("fill", function(d) { return colors(d.mds1); });

    container.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    container.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + 32) + ")")
      .style("text-anchor", "middle")
      .text("Distance");

    container.append("g")
      .call(d3.axisLeft(y));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - svg_margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Distance");
  });
}

function display_scatterplot_matrix(csv){
  d3.csv(path+csv, function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
      d.day_of_week = +d.day_of_week;
      d.vehicle_location = +d.vehicle_location;
      d.special_conditions_at_site = +d.special_conditions_at_site;
    });

    var size = 200,
      padding = 20;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    var domainByTrait = {},
        traits = d3.keys(data[0]).filter(function(d) { return d !== ""; }),
        n = traits.length;

    traits.forEach(function(trait) {
      domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(6)
        .tickSize(size * n);

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(6)
        .tickSize(-size * n);

    var brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend)
        .extent([[0,0],[size,size]]);

    var svg = d3.select("svg");
    svg.selectAll("*").remove();

    var container = svg.append("g")
        .attr("transform", "translate(" + 15*padding + "," + padding / 2 + ")");

    container.selectAll(".x.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    container.selectAll(".y.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = container.selectAll(".cell")
        .data(cross(traits, traits))
      .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    cell.call(brush);

    function plot(p) {
      var cell = d3.select(this);

      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);

      cell.append("rect")
          .attr("class", "frame")
          .attr("x", padding / 2)
          .attr("y", padding / 2)
          .attr("width", size - padding)
          .attr("height", size - padding);

      cell.selectAll("circle")
          .data(data)
        .enter().append("circle")
          .attr("cx", function(d) { return x(d[p.x]); })
          .attr("cy", function(d) { return y(d[p.y]); })
          .attr("r", 4)
          .style("fill", function(d) { return color(d.vehicle_location); });
    }

    var brushCell;

    function brushstart(p) {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);
      }
    }

    function brushmove(p) {
      var e = d3.brushSelection(this);
      container.selectAll("circle").classed("hidden", function(d) {
        return !e
          ? false
          : (
            e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
            || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
          );
      });
    }

    function brushend() {
      var e = d3.brushSelection(this);
      if (e === null) container.selectAll(".hidden").classed("hidden", false);
    }
  });

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }
}

display_samples('LoyalCH', 'new_OJ.csv');