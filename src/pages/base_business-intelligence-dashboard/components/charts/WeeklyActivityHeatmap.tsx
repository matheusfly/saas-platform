import React, { useRef, useEffect } from 'react';
import { WeeklyActivityData } from '../../types';
import EmptyChartState from '../EmptyChartState';

// D3 is globally available via script tag in index.html
declare const d3: any;

interface WeeklyActivityHeatmapProps {
  data: WeeklyActivityData[];
}

const WeeklyActivityHeatmap: React.FC<WeeklyActivityHeatmapProps> = ({ data }) => {
    const d3Container = useRef(null);
    
    if (!data || data.length === 0) {
        return <EmptyChartState message="Dados de atividade semanal insuficientes." />;
    }

    useEffect(() => {
        if (data && data.length > 0 && d3Container.current) {
            const container = d3Container.current as HTMLElement;

            const drawChart = () => {
                d3.select(container).selectAll("*").remove();

                const { width: containerWidth } = container.getBoundingClientRect();
                const margin = { top: 30, right: 30, bottom: 50, left: 50 };
                const width = containerWidth - margin.left - margin.right;
                const height = 250; // Fixed height for this chart
                 d3.select(container).style('height', `${height + margin.top + margin.bottom}px`);

                if (width <= 0 || height <= 0) return;

                const svg = d3.select(container)
                    .append("svg")
                    .attr("width", containerWidth)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                const days = [...new Set(data.map((d: WeeklyActivityData) => d.day))];
                const hours = [...new Set(data.map((d: WeeklyActivityData) => d.hour))].sort((a,b)=>a-b);
                const dayOrder = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                days.sort((a,b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));


                const x = d3.scaleBand()
                    .range([0, width])
                    .domain(hours.map(String))
                    .padding(0.05);

                svg.append("g")
                    .style("font-size", 10)
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).tickSize(0).tickValues(x.domain().filter((d:any,i:any)=> !(i%2)))) // Show every other hour
                    .select(".domain").remove();
                
                const y = d3.scaleBand()
                    .range([height, 0])
                    .domain(days)
                    .padding(0.05);

                svg.append("g")
                    .style("font-size", 12)
                    .call(d3.axisLeft(y).tickSize(0))
                    .select(".domain").remove();

                const colorScale = d3.scaleSequential(d3.interpolateYlGn)
                    .domain([0, d3.max(data, (d: WeeklyActivityData) => d.value) as number]);

                const tooltip = d3.select(container)
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "p-2 bg-surface-header text-text-on-dark rounded-md shadow-lg text-xs")
                    .style("position", "absolute")
                    .style("pointer-events", "none");

                svg.selectAll()
                    .data(data, (d: any) => `${d.day}:${d.hour}`)
                    .enter()
                    .append("rect")
                    .attr("x", (d: WeeklyActivityData) => x(String(d.hour)) as number)
                    .attr("y", (d: WeeklyActivityData) => y(d.day) as number)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", (d: WeeklyActivityData) => d.value > 0 ? colorScale(d.value) : "#efefef")
                    .on("mouseover", (event: MouseEvent) => {
                        tooltip.style("opacity", 1);
                        d3.select(event.currentTarget).style("stroke", "#1E1E1E").style("stroke-width", 1.5);
                    })
                    .on("mousemove", (event: MouseEvent, d: any) => {
                        tooltip.html(`Atividades: ${d.value}<br>${d.day}, ${d.hour}:00-${d.hour+1}:00`)
                            .style("left", (d3.pointer(event, container)[0] + 15) + "px")
                            .style("top", (d3.pointer(event, container)[1]) + "px");
                    })
                    .on("mouseleave", (event: MouseEvent) => {
                        tooltip.style("opacity", 0);
                        d3.select(event.currentTarget).style("stroke", "none");
                    });
            };
            
            const observer = new ResizeObserver(() => {
                drawChart();
            });
            observer.observe(container);
            drawChart();

            return () => observer.unobserve(container);
        }
    }, [data]);

    return <div ref={d3Container} style={{ width: '100%', position: 'relative' }} />;
};

export default WeeklyActivityHeatmap;