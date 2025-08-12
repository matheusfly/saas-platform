import React, { useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';

interface Node {
  id: string;
  name: string;
  group: string;
  size: number;
  productivity: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
  type: string;
}

interface TeamCollaborationNetworkProps {
  nodes: Node[];
  links: Link[];
}

const TeamCollaborationNetwork: React.FC<TeamCollaborationNetworkProps> = ({ 
  nodes, 
  links 
}) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());

  // Get node color based on group
  const getNodeColor = (group: string) => {
    switch (group) {
      case 'sales': return '#8884d8';
      case 'marketing': return '#82ca9d';
      case 'support': return '#ffc658';
      case 'management': return '#ff7300';
      default: return '#0088fe';
    }
  };

  // Get link color based on type
  const getLinkColor = (type: string) => {
    switch (type) {
      case 'collaboration': return '#8884d8';
      case 'mentorship': return '#82ca9d';
      case 'coordination': return '#ffc658';
      default: return '#999';
    }
  };

  // Handle node hover
  const handleNodeHover = (node: Node | null) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    const connectedNodes = new Set<string>();
    const connectedLinks = new Set<string>();
    
    connectedNodes.add(node.id);
    
    links.forEach(link => {
      if (link.source === node.id || link.target === node.id) {
        connectedNodes.add(link.source as string);
        connectedNodes.add(link.target as string);
        connectedLinks.add(`${link.source}-${link.target}`);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };

  // Handle node click
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  // Get node size based on productivity
  const getNodeSize = (productivity: number) => {
    return 5 + (productivity / 100) * 20;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-grow relative">
        {/* Network Visualization */}
        <div className="absolute inset-0">
          <ForceGraph2D
            graphData={{ nodes, links }}
            nodeId="id"
            nodeLabel="name"
            nodeVal={node => getNodeSize(node.productivity)}
            nodeColor={node => 
              highlightNodes.size > 0 && !highlightNodes.has(node.id) 
                ? '#eee' 
                : getNodeColor(node.group)
            }
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
              
              // Draw node
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, getNodeSize(node.productivity), 0, 2 * Math.PI, false);
              ctx.fillStyle = highlightNodes.size > 0 && !highlightNodes.has(node.id) 
                ? '#eee' 
                : getNodeColor(node.group);
              ctx.fill();
              
              // Draw productivity indicator
              const productivityRadius = getNodeSize(node.productivity) * 0.7;
              const productivityAngle = (node.productivity / 100) * 2 * Math.PI;
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, productivityRadius, 0, productivityAngle, false);
              ctx.lineTo(node.x!, node.y!);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fill();
              
              // Draw label
              if (globalScale > 1.5) {
                ctx.fillStyle = '#1E1E1E';
                ctx.fillText(label, node.x! - bckgDimensions[0] / 2, node.y! + bckgDimensions[1] / 2);
              }
            }}
            linkSource="source"
            linkTarget="target"
            linkColor={link => 
              highlightLinks.size > 0 && !highlightLinks.has(`${link.source}-${link.target}`) 
                ? '#eee' 
                : getLinkColor(link.type)
            }
            linkWidth={link => 
              highlightLinks.size > 0 && !highlightLinks.has(`${link.source}-${link.target}`) 
                ? 1 
                : link.value
            }
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            backgroundColor="#ffffff"
          />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Grupos</h4>
          <div className="flex flex-wrap gap-3">
            {['sales', 'marketing', 'support', 'management'].map(group => (
              <div key={group} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getNodeColor(group) }}
                ></div>
                <span className="text-text-main text-sm capitalize">{group}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Tipos de Conexão</h4>
          <div className="flex flex-wrap gap-3">
            {['collaboration', 'mentorship', 'coordination'].map(type => (
              <div key={type} className="flex items-center">
                <div 
                  className="w-4 h-1 mr-2" 
                  style={{ backgroundColor: getLinkColor(type) }}
                ></div>
                <span className="text-text-main text-sm capitalize">
                  {type === 'collaboration' ? 'Colaboração' : 
                   type === 'mentorship' ? 'Mentoria' : 'Coordenação'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="mt-6 bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">
            Detalhes: {selectedNode.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">Grupo</p>
              <p className="text-blue-600 font-bold capitalize">{selectedNode.group}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-green-800 text-sm font-medium">Produtividade</p>
              <p className="text-green-600 text-xl font-bold">{selectedNode.productivity}%</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <p className="text-purple-800 text-sm font-medium">Conexões</p>
              <p className="text-purple-600 text-xl font-bold">
                {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}
              </p>
            </div>
            
            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <p className="text-orange-800 text-sm font-medium">Tamanho</p>
              <p className="text-orange-600 text-xl font-bold">{selectedNode.size}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Network Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Colaboração Total</h4>
          <p className="text-blue-600 text-xl font-bold mt-1">
            {links.length}
          </p>
          <p className="text-blue-600 text-xs">Conexões entre membros</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Membro Mais Conectado</h4>
          <p className="text-green-600 text-sm font-bold mt-1">
            {nodes.reduce((max, node) => {
              const connections = links.filter(l => l.source === node.id || l.target === node.id).length;
              const maxConnections = links.filter(l => l.source === max.id || l.target === max.id).length;
              return connections > maxConnections ? node : max;
            }, nodes[0]).name}
          </p>
          <p className="text-green-600 text-xs">
            {links.filter(l => 
              l.source === nodes.reduce((max, node) => {
                const connections = links.filter(l2 => l2.source === node.id || l2.target === node.id).length;
                const maxConnections = links.filter(l2 => l2.source === max.id || l2.target === max.id).length;
                return connections > maxConnections ? node : max;
              }, nodes[0]).id || 
              l.target === nodes.reduce((max, node) => {
                const connections = links.filter(l2 => l2.source === node.id || l2.target === node.id).length;
                const maxConnections = links.filter(l2 => l2.source === max.id || l2.target === max.id).length;
                return connections > maxConnections ? node : max;
              }, nodes[0]).id
            ).length} conexões
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Produtividade Média</h4>
          <p className="text-purple-600 text-xl font-bold mt-1">
            {(nodes.reduce((sum, node) => sum + node.productivity, 0) / nodes.length).toFixed(1)}%
          </p>
          <p className="text-purple-600 text-xs">Da equipe inteira</p>
        </div>
      </div>
    </div>
  );
};

export default TeamCollaborationNetwork;