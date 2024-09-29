import React, { useEffect, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from 'react-flow-renderer';

interface RoadmapSection {
  title: string;
  items: string[];
}

interface FlowchartDisplayProps {
  role: string;
  roadmapSections: RoadmapSection[];
}

const FlowchartDisplay: React.FC<FlowchartDisplayProps> = ({
  role,
  roadmapSections,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [containerHeight, setContainerHeight] = useState(600); // Default height

  const nodesCache = useRef<{ [key: string]: Node[] }>({});
  const edgesCache = useRef<{ [key: string]: Edge[] }>({});

  useEffect(() => {
    let isCancelled = false;

    const cacheKey = JSON.stringify({ role, roadmapSections });

    if (nodesCache.current[cacheKey]) {
      setNodes(nodesCache.current[cacheKey]);
      setEdges(edgesCache.current[cacheKey]);
      return;
    }

    const generateNodesAndEdges = async () => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Add root node
      const rootNode: Node = {
        id: `root`,
        type: 'input',
        data: { label: role },
        position: { x: 500, y: 0 },
        style: {
          backgroundColor: '#ffd700',
          border: '2px solid #000',
          padding: '10px',
        },
      };

      newNodes.push(rootNode);
      setNodes([...newNodes]);

      const sectionOffsetY = 40;
      const itemOffsetX = 200;
      const itemOffsetY = 100;
      let currentYPos = 100;

      for (
        let sectionIndex = 0;
        sectionIndex < roadmapSections.length;
        sectionIndex++
      ) {
        if (isCancelled) break;

        const section = roadmapSections[sectionIndex];
        const sectionStartY = currentYPos;
        currentYPos += sectionOffsetY + itemOffsetY * section.items.length;

        const sectionId = `section-${sectionIndex}`;
        const sectionNode: Node = {
          id: sectionId,
          data: { label: section.title },
          position: { x: 500, y: sectionStartY },
          style: {
            backgroundColor: '#ffd700',
            border: '2px solid #000',
            padding: '10px',
          },
        };

        newNodes.push(sectionNode);
        newEdges.push({
          id: `edge-root-${sectionId}`,
          source: `root`,
          target: sectionId,
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2, stroke: '#007BFF', strokeDasharray: '5 5' },
        });

        setNodes([...newNodes]);
        setEdges([...newEdges]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const halfItems = Math.ceil(section.items.length / 2);

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          if (isCancelled) break;

          const item = section.items[itemIndex];
          const isLeft = itemIndex < halfItems;
          const itemXPos = isLeft ? 300 : 700;
          const itemYPos =
            sectionStartY + itemOffsetY * (itemIndex % halfItems);

          const itemId = `item-${sectionIndex}-${itemIndex}`;
          const itemNode: Node = {
            id: itemId,
            data: { label: item },
            position: { x: itemXPos, y: itemYPos },
            style: {
              backgroundColor: '#ffffcc',
              border: '2px solid #000',
              borderRadius: '5px',
              padding: '10px',
            },
          };

          newNodes.push(itemNode);
          newEdges.push({
            id: `edge-${sectionId}-${itemId}`,
            source: sectionId,
            target: itemId,
            type: 'smoothstep',
            animated: true,
            style: {
              strokeWidth: 2,
              stroke: '#007BFF',
              strokeDasharray: '5 5',
            },
          });

          setNodes([...newNodes]);
          setEdges([...newEdges]);

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      nodesCache.current[cacheKey] = newNodes;
      edgesCache.current[cacheKey] = newEdges;

      // Dynamically calculate height based on the number of items and sections
      const estimatedHeight = currentYPos + 100; // Add some padding
      setContainerHeight(estimatedHeight);
    };

    generateNodesAndEdges();

    return () => {
      isCancelled = true;
    };
  }, [role, roadmapSections]);

  return (
    <div style={{ width: '100%', height: '600px', overflowY: 'scroll' }}>
      <div style={{ height: `${containerHeight}px`, width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            height: '100%',
            width: '100%',
          }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowchartDisplay;
