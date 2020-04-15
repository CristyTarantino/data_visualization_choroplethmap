'use strict';

import 'normalize.css';

require('./styles/index.scss');

const projectName="choropleth";
localStorage.setItem('example_project', '3: Choropleth');

const edu_url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';;
const country_url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const margin = {
    top: 100,
    right: 20,
    bottom: 60,
    left: 60
  },
  width = 1420 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const svg = d3.select('main')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

svg.append('text')
  .attr('id', 'title')
  .attr('x', (width / 2))
  .attr('y', 0 - (margin.top / 2))
  .attr('text-anchor', 'middle')
  .style('font-size', '30px')
  .text('United States Educational Attainment');

svg.append('text')
  .attr('id', 'description')
  .attr('x', (width / 2))
  .attr('y', 35 - (margin.top / 2))
  .attr('text-anchor', 'middle')
  .style('font-size', '20px')
  .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

const buildMap = (edu, country) => {
  const graph = svg.append('g')
    .attr('class', 'graph')
    .attr('transform', 'translate(' + (width - margin.left - margin.right)/6 + ',' + 0 + ')');

  const min = d3.min(edu, d => d.bachelorsOrHigher);
  const max = d3.max(edu, d => d.bachelorsOrHigher);

  const numOfColors = 8;

  const colorScale = d3.scaleThreshold()
    .domain(d3.range(min, max, (max-min)/numOfColors))
    .range(d3.schemeGreens[numOfColors+1]);

  // tooltip
  const tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .attr('id', 'tooltip')
    .html(d => {
      const result = edu.filter( obj => obj['fips'] === d.id);
      if(result[0]){
        tooltip.attr('data-education', result[0].bachelorsOrHigher);
        return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
      }
      //could not find a matching fips id in the data
      return 0;
    })
    .direction('n')
    .offset([-10, 0]);

  graph.call(tooltip);


  // Draw the counties map
  const path = d3.geoPath();

  graph.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(country, country.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const result = edu.filter( obj => obj['fips'] === d.id);
      if(result[0]){
        return result[0].bachelorsOrHigher
      }
      //could not find a matching fips id in the data
      console.log('could find data for: ', d.id);
      return 0
    })
    .attr("fill", d => {
      const result = edu.filter(obj => obj['fips'] === d.id);
      if(result[0]){
        return colorScale(result[0].bachelorsOrHigher)
      }
      //could not find a matching fips id in the data
      return colorScale(0)
    })
    .attr("d", path)
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide);

  // Draw the states map
  graph.append("g")
    .attr("class", "states")
    .datum(topojson.mesh(country, country.objects.states, (a, b) => a !== b))
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  // Legend
  const blockSize = 30;

  // create the legend
  const legend = graph
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(' + (width + margin.right - 130)/2 + ',' + 10 + ')');

  // create the rect colored
  legend
    .selectAll('rect')
    .data(colorScale.domain())
    .enter()
    .append('rect')
    .attr('width', blockSize)
    .attr('height', blockSize/2)
    .attr('x', (d, i) => i * blockSize)
    .attr('y', 0)
    .style('fill', colorScale);

  // create the ticks
  const legendX = d3.scaleLinear()
    .domain([min, max])
    .range([0, numOfColors * blockSize]);

  const legendXAxis = d3.axisBottom(legendX)
    .tickSize(blockSize/2 + 5)
    .tickFormat(d =>  Math.round(d) + '%' )
    .tickValues(colorScale.domain());

  legend.call(legendXAxis)
    // remove the top axis bar path
    .select(".domain")
    .remove();
};

d3.queue()
  .defer(d3.json, edu_url)
  .defer(d3.json, country_url)
  .await((error, edu, country) => !error && buildMap(edu, country));
