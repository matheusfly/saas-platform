import React, { useRef, useEffect } from 'react';
import { CohortData } from '../../types';

// D3 is globally available via script tag in index.html
declare const d3: any;

interface CohortAnalysisChartProps {
  data: CohortData[];
}

const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && data.length > 0 && d3Container.current) {
            const container = d3Container.current as HTMLElement;

            const drawChart = () => {
                d3.select(container).selectAll("*").remove();

                const { width: containerWidth } = container.getBoundingClientRect();
                const margin = { top: 30, right: 30, bottom: 50, left: 100 };
                const width = containerWidth - margin.left - margin.right;
                
                // Dynamic height based on number of cohorts
                const cellHeight = 30;
                const height = data.length * cellHeight;
                const containerHeight = height + margin.top + margin.bottom;

                if (width <= 0 || height <= 0) return;
                
                d3.select(container).style('height', `${containerHeight}px`);

                const svg = d3.select(container)
                    .append("svg")
                    .attr("width", containerWidth)
                    .attr("height", containerHeight)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                const maxMonths = d3.max(data, (d: CohortData) => d.values.length);

                const x = d3.scaleBand()
                    .range([0, width])
                    .domain(Array.from({length: maxMonths}, (_, i) => `Mês ${i}`))
                    .padding(0.05);

                const y = d3.scaleBand()
                    .range([0, height])
                    .domain(data.map((d: CohortData) => d.cohort))
                    .padding(0.05);
                
                const colorScale = d3.scaleSequential(d3.interpolateYlGn)
                    .domain([0, 100]);

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).tickSize(0))
                    .call((g: any) => g.select(".domain").remove())
                    .selectAll("text")
                    .style("font-size", "11px")
                    .style("fill", "#858360");

                svg.append("g")
                    .call(d3.axisLeft(y).tickSize(0))
                    .call((g: any) => g.select(".domain").remove())
                    .selectAll("text")
                    .style("font-size", "12px")
                    .style("fill", "#1E1E1E");
                
                // Tooltip
                const tooltip = d3.select(container)
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "p-2 bg-surface-header text-text-on-dark rounded-md shadow-lg text-xs")
                    .style("position", "absolute")
                    .style("pointer-events", "none");

                // Flatten data for cells
                const cellData = data.flatMap(d => 
                    d.values.map(v => ({
                        cohort: d.cohort,
                        size: d.size,
                        month: v.month,
                        percentage: v.percentage
                    }))
                );

                svg.selectAll()
                    .data(cellData)
                    .enter()
                    .append("rect")
                    .attr("x", (d: any) => x(`Mês ${d.month}`) as number)
                    .attr("y", (d: any) => y(d.cohort) as number)
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", (d: any) => d.percentage > 0 ? colorScale(d.percentage) : "#efefef")
                    .on("mouseover", (event: MouseEvent, d: any) => {
                        tooltip.style("opacity", 1);
                        d3.select(event.currentTarget).style("stroke", "#1E1E1E").style("stroke-width", 2);
                    })
                    .on("mousemove", (event: MouseEvent, d: any) => {
                        tooltip.html(`Coorte: ${d.cohort} (n=${d.size})<br>Mês: ${d.month}<br>Retenção: ${d.percentage.toFixed(1)}%`)
                            .style("left", (d3.pointer(event, container)[0] + 15) + "px")
                            .style("top", (d3.pointer(event, container)[1]) + "px");
                    })
                    .on("mouseleave", (event: MouseEvent, d: any) => {
                        tooltip.style("opacity", 0);
                        d3.select(event.currentTarget).style("stroke", "none");
                    });
                
                // Add text inside cells
                svg.selectAll()
                    .data(cellData)
                    .enter()
                    .append("text")
                    .text((d: any) => `${d.percentage.toFixed(0)}%`)
                    .attr("x", (d: any) => (x(`Mês ${d.month}`) as number) + x.bandwidth() / 2)
                    .attr("y", (d: any) => (y(d.cohort) as number) + y.bandwidth() / 2)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .style("font-size", "10px")
                    .style("fill", (d: any) => d.percentage > 60 ? "white" : "#1E1E1E")
                    .style("pointer-events", "none");
            };
            
            const observer = new ResizeObserver(() => {
                drawChart();
            });
            observer.observe(container);

            drawChart();

            return () => {
                observer.unobserve(container);
            };
        }
    }, [data]);

    return <div ref={d3Container} style={{ width: '100%', position: 'relative' }} />;
};

export default CohortAnalysisChart;
