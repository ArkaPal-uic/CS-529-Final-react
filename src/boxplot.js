import React, { useEffect, useState } from "react";
import * as d3 from "d3";

export default function BoxPlot(props) {
  const [boxPlotData, setBoxPlotData] = useState();

  async function fetchBoxPlotData() {
    try {
      const response = await fetch("JSON/boxplot_data.json");
      const data = await response.json();

      data.forEach((d) => {
        const magnitudes = d.Magnitude;
        d.q1 = d3.quantile(magnitudes, 0.25);
        d.median = d3.quantile(magnitudes, 0.5);
        d.q3 = d3.quantile(magnitudes, 0.75);
      });

      setBoxPlotData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchBoxPlotData();
  }, []);

  useEffect(() => {
    if (boxPlotData) {
      // Filter boxPlotData based on selectedAttacks
      // const filteredData = boxPlotData.filter(d => props.selectedAttacks.includes(d.label));
      const selectedAttacks =
        props.selectedAttacks && props.selectedAttacks.length > 0
          ? props.selectedAttacks
          : boxPlotData.map((d) => d.label);

      // console.log("SelectedAttacks: ", selectedAttacks)
      const filteredData = boxPlotData.filter((d) =>
        selectedAttacks.includes(d.label)
      );

      d3.select("#boxplot_chart").select("svg").remove();

      // console.log("box plot props: ", props.selectedAttacks)

      var svg = d3
        .select("#boxplot_chart")
        .append("svg")
        .attr("width", 700)
        .attr("height", 550);

      const xScale = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.label))
        .range([0, 750])
        .padding(1);

      svg
        .append("g")
        .attr("transform", "translate(0, 400)")
        .call(d3.axisBottom(xScale))
        .selectAll("text") // Select all text elements for customization
        .style("text-anchor", "end") // Align text to the end of the tick
        .attr("transform", "rotate(-45) translate(-5, -5)"); // Rotate the text for better visibility and adjust translation

      // x-axis label
      svg
        .append("text")
        .attr("transform", "translate(" + 700 / 2 + " ," + 500 + ")")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Attack type");

      // y-axis label
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x", 0 - 400 / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Magnitude");

      // Remove ticks at the extremes of the x-axis
      svg.select(".domain").remove(); // Remove the axis line

      const yScale = d3
        .scaleLinear()
        // .domain([0, d3.max(boxPlotData.flatMap(d => d.Magnitude))])
        .domain([0, d3.max(filteredData.flatMap((d) => d.Magnitude))])
        .range([400, 0]);

      const yAxis = d3.axisLeft(yScale).ticks(5);

      svg.append("g").attr("transform", "translate(50, 0)").call(yAxis);

      svg
        .selectAll(".box")
        // .data(boxPlotData)
        .data(filteredData, (d) => d.label)
        .enter()
        .append("rect")
        .attr("class", "box")
        .attr("x", (d) => xScale(d.label) - 10)
        .attr("y", (d) => yScale(d.q3))
        .attr("width", 20)
        .attr("height", (d) => yScale(d.q1) - yScale(d.q3))
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      svg
        .selectAll(".whisker")
        // .data(boxPlotData)
        .data(filteredData)
        .enter()
        .append("line")
        .attr("class", "whisker")
        .attr("x1", (d) => xScale(d.label))
        .attr("y1", (d) => yScale(d3.min(d.Magnitude)))
        .attr("x2", (d) => xScale(d.label))
        .attr("y2", (d) => yScale(d3.max(d.Magnitude)))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      svg
        .selectAll(".upperWhisker")
        // .data(boxPlotData)
        .data(filteredData)
        .enter()
        .append("line")
        .attr("class", "upperWhisker")
        .attr("x1", (d) => xScale(d.label) - 10)
        .attr("y1", (d) => yScale(d3.max(d.Magnitude)))
        .attr("x2", (d) => xScale(d.label) + 10)
        .attr("y2", (d) => yScale(d3.max(d.Magnitude)))
        .attr("stroke", "green")
        .attr("stroke-width", 2);

      svg
        .selectAll(".lowerWhisker")
        // .data(boxPlotData)
        .data(filteredData)
        .enter()
        .append("line")
        .attr("class", "lowerWhisker")
        .attr("x1", (d) => xScale(d.label) - 10)
        .attr("y1", (d) => yScale(d3.min(d.Magnitude)))
        .attr("x2", (d) => xScale(d.label) + 10)
        .attr("y2", (d) => yScale(d3.min(d.Magnitude)))
        .attr("stroke", "blue")
        .attr("stroke-width", 2);

      svg
        .selectAll(".median")
        // .data(boxPlotData)
        .data(filteredData)
        .enter()
        .append("line")
        .attr("class", "median")
        .attr("x1", (d) => xScale(d.label) - 5)
        .attr("y1", (d) => yScale(d.median))
        .attr("x2", (d) => xScale(d.label) + 5)
        .attr("y2", (d) => yScale(d.median))
        .attr("stroke", "purple")
        .attr("stroke-width", 1);

      // X-axis line
      svg
        .append("line")
        .attr("x1", 50)
        .attr("y1", 400)
        .attr("x2", 650)
        .attr("y2", 400)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    }
  }, [boxPlotData, props.selectedAttacks]);

  return (
    <>
      <h4>Magnitude distribution of different attacks</h4>
      <div id="boxplot_chart"></div>
    </>
  );
}
