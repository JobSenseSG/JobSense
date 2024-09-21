import React, { useState, useEffect } from 'react';
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

const RoadmapGenerator: React.FC = () => {
  const [term, setTerm] = useState('');
  const [roadmapData, setRoadmapData] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const fetchRoadmap = async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term: searchTerm }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch roadmap data');
      }

      const result = await response.text();
      setRoadmapData(result);
    } catch (error: any) {
      console.error(error);
      alert(
        error.message || 'An error occurred while fetching the roadmap data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const parseRoadmapData = (data: string): RoadmapSection[] => {
    const lines = data.split('\n');
    const sections: RoadmapSection[] = [];
    let currentSection: RoadmapSection | null = null;

    lines.forEach((line) => {
      line = line.trim();

      // Skip empty lines and special tokens
      if (
        !line ||
        line.startsWith('@ROADMAPID') ||
        line.startsWith('@ROADMAPSLUG') ||
        line.startsWith('# ')
      ) {
        return;
      }

      if (line.startsWith('## ')) {
        // New section
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          items: [],
        };
      } else if (line.startsWith('- ')) {
        // Sub-item
        const item = line.replace('- ', '').trim();
        currentSection?.items.push(item);
      }
    });

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  useEffect(() => {
    if (roadmapData) {
      // Generate flowchart data from parsed roadmap
      const roadmapSections = parseRoadmapData(roadmapData);
      generateFlowchart(roadmapSections);
    }
  }, [roadmapData]);

  const generateFlowchart = (sections: RoadmapSection[]) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Center the root node at the top
    newNodes.push({
      id: 'root',
      type: 'input',
      data: { label: term },
      position: { x: 0, y: 0 }, // Root node at the center
    });

    const sectionOffsetY = 80; // Vertical distance between section nodes
    const itemOffsetX = 200; // Horizontal spacing for symmetry
    const itemOffsetY = 40; // Vertical spacing between sibling child nodes
    let currentYPos = 0;

    sections.forEach((section, sectionIndex) => {
      // Adjust currentYPos to account for the previous section's height
      if (sectionIndex > 0) {
        currentYPos +=
          sectionOffsetY +
          itemOffsetY *
            Math.max(sections[sectionIndex - 1].items.length - 1, 0);
      } else {
        currentYPos += sectionOffsetY;
      }

      // Add section node centered horizontally
      const sectionId = `section-${sectionIndex}`;
      const parentXPos = 0; // Centered on the X-axis
      const parentYPos = currentYPos; // Current vertical position

      newNodes.push({
        id: sectionId,
        data: { label: section.title },
        position: { x: parentXPos, y: parentYPos },
        style: {
          backgroundColor: '#ffd700',
          border: '2px solid #000',
          padding: '10px',
        }, // Highlight section nodes
      });

      // Add edge from root to section with SOLID styling for vertical line
      newEdges.push({
        id: `edge-root-${sectionId}`,
        source: sectionIndex === 0 ? 'root' : `section-${sectionIndex - 1}`, // Connect to previous section
        target: sectionId,
        type: 'straight',
        animated: false,
        style: { strokeWidth: 2, stroke: '#0000ff' }, // Solid line for vertical parent connection
      });

      // Mirror child nodes symmetrically around the section node
      const numberOfItems = section.items.length;
      const halfItems = Math.ceil(numberOfItems / 2);

      section.items.forEach((item, itemIndex) => {
        const itemId = `item-${sectionIndex}-${itemIndex}`;

        // Split into two columns (left and right)
        const isLeft = itemIndex < halfItems;
        const mirrorIndex = itemIndex % halfItems;

        // Calculate X positions symmetrically around the parent node
        const itemXPos = isLeft
          ? parentXPos - (mirrorIndex + 1) * itemOffsetX // Left side mirrors right
          : parentXPos + (mirrorIndex + 1) * itemOffsetX; // Right side mirrors left

        // Align Y positions vertically relative to parent node
        const itemYPos = parentYPos + mirrorIndex * itemOffsetY;

        // Add child node
        newNodes.push({
          id: itemId,
          data: { label: item },
          position: { x: itemXPos, y: itemYPos },
          style: {
            backgroundColor: '#ffffcc',
            borderRadius: '5px',
            padding: '10px',
          },
        });

        // Connect each child node to the parent section node with dashed edges
        newEdges.push({
          id: `edge-${sectionId}-${itemId}`,
          source: sectionId,
          target: itemId,
          type: 'straight',
          animated: true,
          style: { strokeWidth: 2, stroke: '#0000ff', strokeDasharray: '5 5' }, // Dotted edges for children
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div>
      <h1>Generate Roadmap</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchRoadmap(term);
        }}
      >
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Enter a topic (e.g., Game Development)"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </form>

      {roadmapData && (
        <div
          style={{
            height: '1000px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
