// @TODO: YOUR CODE HERE!
// based on D3 Day 3 Activity 12

// Create the canvas
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 50,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("class", "chart");
console.log(svg)

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
// updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    
  if (chosenXAxis === "poverty") {
    label = "In Poverty:";
  }
  else if  (chosenXAxis === "age") {
    label = "Age (Median)";}
  else {
      label = "House Hold Income (Median):";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(z) {
      return (`${z.state}<br>${label} ${z[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
.then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty
    data.healthcare = +data.healthcare
    data.age = +data.age
    data.smokes = +data.smokes
    data.income = +data.income
    data.obesity = +data.obesity
    ;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".3");

  // Create group for thre x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var PovertyRateLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var AgeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var IncomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("House Income (Median) ");

//  append multiple y axis
  var Healthlabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 60)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");
  
  var Smokelabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  var ObesityLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obese (%)");

 
// updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

         // replaces chosenXAxis with value
        chosenXAxis = value;



// updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

//  updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

//  updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

//   updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          PovertyRateLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          Healthlabel
            .classed("active", true)
            .classed("inactive", false);
          Smokelabel
            .classed("active", false)
            .classed("inactive", true);
          ObesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          PovertyRateLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          Healthlabel
            .classed("active", false)
            .classed("inactive", true);
          Smokelabel
            .classed("active", true)
            .classed("inactive", false);
          ObesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          PovertyRateLabel
            .classed("active", false)
            .classed("inactive", true);
          Healthlabel
            .classed("active", false)
            .classed("inactive", false);
          Smokelabel
            .classed("active", false)
            .classed("inactive", true);
          ObesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
      })
  



}).catch(function(error) {
  console.log(error)
});