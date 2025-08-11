import React, { useRef, useEffect } from 'react';
import { SalesCycleBoxPlotData } from '../../types';

// D3 is globally available via script tag in index.html
declare const d3: any;

interface SalesCycleBoxPlotProps {
  data: SalesCycleBoxPlotData[];
}

const SalesCycleBoxPlot: React.FC<SalesCycleBoxPlotProps> = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && data.length > 0 && d3Container.current) {
            const container = d3Container.current as HTMLElement;

            const drawChart = () => {
                d3.select(container).selectAll("*").remove();

                const { width: containerWidth } = container.getBoundingClientRect();
                const margin = { top: 20, right: 30, bottom: 40, left: 50 };
                const width = containerWidth - margin.left - margin.right;
                const height = 450 - margin.top - margin.bottom;

                if (width <= 0 || height <= 0) return;

                const svg = d3.select(container)
                    .append("svg")
                    .attr("width", containerWidth)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                const y = d3.scaleBand()
                    .range([height, 0])
                    .domain(data.map((d: SalesCycleBoxPlotData) => d.user))
                    .padding(0.4);

                svg.append("g")
                    .call(d3.axisLeft(y).tickSize(0))
                    .select(".domain").remove();

                const maxValue = d3.max(data.flatMap((d: SalesCycleBoxPlotData) => [d.max, ...d.outliers]));
                const x = d3.scaleLinear()
                    .domain([0, maxValue as number * 1.1])
                    .range([0, width]);

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).ticks(5))
                    .select(".domain").remove();

                // Add X axis label:
                svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width)
                    .attr("y", height + margin.bottom - 5)
                    .attr("fill", "#858360")
                    .text("Dias para Fechamento");

                // Show the main vertical line
                svg.selectAll("vertLines")
                    .data(data)
                    .enter()
                    .append("line")
                        .attr("y1", (d: SalesCycleBoxPlotData) => y(d.user) as number)
                        .attr("y2", (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth())
                        .attr("x1", (d: SalesCycleBoxPlotData) => x(d.median))
                        .attr("x2", (d: SalesCycleBoxPlotData) => x(d.median))
                        .attr("stroke", "black")
                        .style("width", 40)

                // rectangle for the main box
                svg.selectAll("boxes")
                    .data(data)
                    .enter()
                    .append("rect")
                        .attr("y", (d: SalesCycleBoxPlotData) => y(d.user) as number)
                        .attr("height", y.bandwidth())
                        .attr("x", (d: SalesCycleBoxPlotData) => x(d.q1))
                        .attr("width", (d: SalesCycleBoxPlotData) => (x(d.q3) - x(d.q1)))
                        .attr("stroke", "black")
                        .style("fill", "#B0D236")
                        .style("opacity", 0.8)
                
                 // Whiskers
                svg.selectAll("whiskers")
                   .data(data)
                   .enter()
                   .append("line")
                   .attr('x1', (d: SalesCycleBoxPlotData) => x(d.min))
                   .attr('x2', (d: SalesCycleBoxPlotData) => x(d.q1))
                   .attr('y1', (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth() / 2)
                   .attr('y2', (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth() / 2)
                   .attr('stroke', '#1E1E1E');
                
                svg.selectAll("whiskers")
                   .data(data)
                   .enter()
                   .append("line")
                   .attr('x1', (d: SalesCycleBoxPlotData) => x(d.q3))
                   .attr('x2', (d: SalesCycleBoxPlotData) => x(d.max))
                   .attr('y1', (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth() / 2)
                   .attr('y2', (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth() / 2)
                   .attr('stroke', '#1E1E1E');

                // Median line
                svg.selectAll("medianLines")
                    .data(data)
                    .enter()
                    .append("line")
                        .attr("y1", (d: SalesCycleBoxPlotData) => y(d.user) as number)
                        .attr("y2", (d: SalesCycleBoxPlotData) => (y(d.user) as number) + y.bandwidth())
                        .attr("x1", (d: SalesCycleBoxPlotData) => x(d.median))
                        .attr("x2", (d: SalesCycleBoxPlotData) => x(d.median))
                        .attr("stroke", "#1E1E1E")
                        .style("stroke-width", 2)
                
                // Outliers
                const jitterWidth = 40;
                svg.selectAll("outliers")
                    .data(data.flatMap(d => d.outliers.map(o => ({ user: d.user, value: o }))))
                    .enter()
                    .append("circle")
                        .attr("cx", d => x(d.value))
                        .attr("cy", d => (y(d.user) as number) + (y.bandwidth() / 2) - (jitterWidth / 2) + (Math.random() * jitterWidth))
                        .attr("r", 4)
                        .style("fill", "#D9534F")
                        .attr("stroke", "white");
                
                svg.selectAll("text, line").style("stroke", "#858360");
                svg.selectAll("g.tick text").style("fill", "#1E1E1E");
            };
            
            const observer = new ResizeObserver(drawChart);
            observer.observe(container);
            drawChart();
            return () => observer.unobserve(container);
        }
    }, [data]);

     if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-muted">Dados de ciclo de venda insuficientes para gerar o gráfico.</div>;
    }

    return <div ref={d3Container} style={{ width: '100%', height: '100%' }} />;
};

export default SalesCycleBoxPlot;
