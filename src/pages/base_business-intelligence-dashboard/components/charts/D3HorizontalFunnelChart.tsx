import React, { useRef, useEffect } from 'react';
import { StageEntryData } from '../../types';

// D3 is globally available via script tag in index.html
declare const d3: any;

interface D3HorizontalFunnelChartProps {
  data: StageEntryData[];
}

const D3HorizontalFunnelChart: React.FC<D3HorizontalFunnelChartProps> = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && data.length > 0 && d3Container.current) {
            const container = d3Container.current as HTMLElement;

            const drawChart = () => {
                // Clear previous SVG to prevent duplicates on redraw
                d3.select(container).selectAll("*").remove();
                
                const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

                const margin = { top: 20, right: 80, bottom: 40, left: 120 };
                const width = containerWidth - margin.left - margin.right;
                const height = containerHeight - margin.top - margin.bottom;

                if (width <= 0 || height <= 0) return;

                const svg = d3.select(container)
                    .append("svg")
                    .attr("width", containerWidth)
                    .attr("height", containerHeight)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                // Color scale from the user prompt's palette
                const colorScale = d3.scaleOrdinal()
                    .domain(data.map(d => d.stage))
                    .range(["#556B2F", "#78866B", "#808000", "#BDB58A", "#6F6C4B", "#F0E68C", "#B0D236"]);

                const y = d3.scaleBand()
                    .domain(data.map(d => d.stage))
                    .range([0, height])
                    .padding(0.2);

                const x = d3.scaleLinear()
                    .domain([0, d3.max(data, (d: StageEntryData) => d.value) as number])
                    .nice()
                    .range([0, width]);

                // Y-Axis
                svg.append("g")
                    .call(d3.axisLeft(y).tickSize(0))
                    .call((g: any) => g.select(".domain").remove())
                    .selectAll("text")
                    .style("font-size", "12px")
                    .style("fill", "#1E1E1E");
                
                // X-Axis
                svg.append("g")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x).ticks(Math.min(5, width / 80)).tickFormat((d: any) => d > 0 ? d3.format("~s")(d) : 0))
                    .call((g: any) => g.select(".domain").remove())
                    .selectAll("text")
                    .style("font-size", "12px")
                    .style("fill", "#1E1E1E");
                
                // Grid lines
                svg.append("g")			
                    .attr("class", "grid")
                    .style("stroke-opacity", 0.3)
                    .call(d3.axisBottom(x).tickSize(height).tickFormat(""));

                // Bars
                svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("y", (d: StageEntryData) => y(d.stage) as number)
                    .attr("height", y.bandwidth())
                    .attr("x", 0)
                    .attr("width", 0) // for transition
                    .attr("fill", (d: StageEntryData) => colorScale(d.stage))
                    .transition()
                    .duration(800)
                    .attr("width", (d: StageEntryData) => x(d.value));

                // Labels
                svg.selectAll(".label")
                    .data(data)
                    .enter().append("text")
                    .attr("class", "label")
                    .attr("x", (d: StageEntryData) => x(d.value) + 5)
                    .attr("y", (d: StageEntryData) => (y(d.stage) as number) + y.bandwidth() / 2)
                    .attr("dy", "0.35em")
                    .text((d: StageEntryData) => d.value)
                    .attr("fill", "#1E1E1E")
                    .style("font-size", "12px")
                    .style("opacity", 0) // for transition
                    .transition()
                    .duration(800)
                    .delay(400)
                    .style("opacity", 1);
                
                // Axis lines cleanup
                svg.selectAll("line").style("stroke", "#BDB58A");
            };
            
            // Use ResizeObserver to make the chart responsive
            const observer = new ResizeObserver(() => {
                drawChart();
            });
            observer.observe(container);

            // Initial draw
            drawChart();

            return () => {
                observer.unobserve(container);
            };
        }
    }, [data]);

    return <div ref={d3Container} style={{ width: '100%', height: '100%' }} />;
};

export default D3HorizontalFunnelChart;
