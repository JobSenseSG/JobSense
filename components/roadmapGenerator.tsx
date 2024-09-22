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
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [flowcharts, setFlowcharts] = useState<
    { role: string; nodes: Node[]; edges: Edge[] }[]
  >([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const text = localStorage.getItem('extractedText') || '';
      setExtractedText(text);
    }
  }, []);

  const splitResumes = (text: string): string[] => {
    return text
      .split(
        '\n----------------------------------------------------------------\n'
      )
      .filter((resume) => resume.trim() !== '');
  };

  const fetchRoleForResume = async (resumeText: string): Promise<string> => {
    try {
      const response = await fetch('/api/get-higher-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch role data');
      }

      const result = await response.json();
      return result.roleTitle; // Assuming the API returns { roleTitle: '...' }
    } catch (error: any) {
      console.error(error);
      throw error; // Re-throw the error to be caught in the caller
    }
  };

  const fetchRoadmap = async (role: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch roadmap data');
      }

      const result = await response.text();
      return result;
    } catch (error: any) {
      console.error(error);
      throw error;
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

  const generateFlowchart = (
    sections: RoadmapSection[],
    role: string,
    index: number
  ): { nodes: Node[]; edges: Edge[] } => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Center the root node at the top
    newNodes.push({
      id: `root-${index}`,
      type: 'input',
      data: { label: role },
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
      const sectionId = `section-${index}-${sectionIndex}`;
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

      // Add edge from root to section
      newEdges.push({
        id: `edge-root-${sectionId}`,
        source:
          sectionIndex === 0
            ? `root-${index}`
            : `section-${index}-${sectionIndex - 1}`,
        target: sectionId,
        type: 'straight',
        animated: false,
        style: { strokeWidth: 2, stroke: '#0000ff' }, // Solid line
      });

      // Mirror child nodes symmetrically around the section node
      const numberOfItems = section.items.length;
      const halfItems = Math.ceil(numberOfItems / 2);

      section.items.forEach((item, itemIndex) => {
        const itemId = `item-${index}-${sectionIndex}-${itemIndex}`;

        // Split into two columns (left and right)
        const isLeft = itemIndex < halfItems;
        const mirrorIndex = itemIndex % halfItems;

        // Calculate X positions symmetrically around the parent node
        const itemXPos = isLeft
          ? parentXPos - (mirrorIndex + 1) * itemOffsetX // Left side
          : parentXPos + (mirrorIndex + 1) * itemOffsetX; // Right side

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

        // Connect each child node to the parent section node
        newEdges.push({
          id: `edge-${sectionId}-${itemId}`,
          source: sectionId,
          target: itemId,
          type: 'straight',
          animated: true,
          style: { strokeWidth: 2, stroke: '#0000ff', strokeDasharray: '5 5' },
        });
      });
    });

    return { nodes: newNodes, edges: newEdges };
  };

  const processResumes = async () => {
    setLoading(true);
    try {
      const resumes = splitResumes(extractedText);
      const newFlowcharts = [];

      for (let i = 0; i < resumes.length; i++) {
        const resume = resumes[i];
        // Fetch the higher role for this resume
        const role = await fetchRoleForResume(resume);
        // Fetch the roadmap for this role
        const roadmapData = await fetchRoadmap(role);
        // Parse the roadmap data
        const roadmapSections = parseRoadmapData(roadmapData);
        // Generate nodes and edges
        const { nodes, edges } = generateFlowchart(roadmapSections, role, i);
        // Store the role and flowchart data
        newFlowcharts.push({ role, nodes, edges });
      }

      setFlowcharts(newFlowcharts);
    } catch (error) {
      console.error(error);
      alert('An error occurred while processing the resumes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Generate Roadmaps</h1>
      <button onClick={processResumes} disabled={loading || !extractedText}>
        {loading ? 'Generating...' : 'Generate Roadmaps'}
      </button>

      {flowcharts.length > 0 &&
        flowcharts.map((flowchart, index) => (
          <div
            key={index}
            style={{ height: '1000px', width: '100%', margin: '50px 0' }}
          >
            <h2>Roadmap for {flowchart.role}</h2>
            <ReactFlow
              nodes={flowchart.nodes}
              edges={flowchart.edges}
              fitView
              style={{ border: '1px solid #ccc' }}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        ))}
    </div>
  );
};

export default RoadmapGenerator;
