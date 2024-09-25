import React, { useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from 'react-flow-renderer';
import styles from './RoadmapGenerator.module.css';

interface RoadmapSection {
  title: string;
  items: string[];
}

interface Flowchart {
  employeeName: string;
  role: string;
  nodes: Node[];
  edges: Edge[];
}

const RoadmapGenerator: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Save flowcharts and active tab to localStorage when updated
  useEffect(() => {
    if (flowcharts.length > 0) {
      localStorage.setItem('flowcharts', JSON.stringify(flowcharts));
    }
  }, [flowcharts]);

  // Save activeTab index to localStorage whenever it changes
  useEffect(() => {
    if (activeTab !== null) {
      localStorage.setItem('activeTab', activeTab.toString());
    }
  }, [activeTab]);

  // Load flowcharts and activeTab from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFlowcharts = localStorage.getItem('flowcharts');
      if (savedFlowcharts) {
        setFlowcharts(JSON.parse(savedFlowcharts));
      }

      const savedActiveTab = localStorage.getItem('activeTab');
      if (savedActiveTab) {
        setActiveTab(Number(savedActiveTab));
      }

      const text = localStorage.getItem('extractedText') || '';
      setExtractedText(text);
    }
  }, []);

  const splitResumes = (text: string): { resume: string }[] => {
    const resumes = text
      .split(
        '\n----------------------------------------------------------------\n'
      )
      .filter((resume) => resume.trim() !== '');
    return resumes.map((resume) => ({ resume }));
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const fetchEmployeeName = async (resumeText: string): Promise<string> => {
    try {
      const response = await fetch('/api/getEmployeeName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch employee name');
      }

      const result = await response.json();
      return result.employeeName;
    } catch (error: any) {
      console.error('Error fetching employee name:', error);
      throw error;
    }
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
      return result.roleTitle;
    } catch (error: any) {
      console.error('Error fetching role:', error);
      throw error;
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

      if (
        !line ||
        line.startsWith('@ROADMAPID') ||
        line.startsWith('@ROADMAPSLUG') ||
        line.startsWith('# ')
      ) {
        return;
      }

      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          items: [],
        };
      } else if (line.startsWith('- ')) {
        const item = line.replace('- ', '').trim();
        currentSection?.items.push(item);
      }
    });

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

    newNodes.push({
      id: `root-${index}`,
      type: 'input',
      data: { label: role },
      position: { x: 500, y: 0 },
      style: {
        backgroundColor: '#ffd700',
        border: '2px solid #000',
        padding: '10px',
      },
    });

    const sectionOffsetY = 40;
    const itemOffsetX = 200;
    const itemOffsetY = 100;
    let currentYPos = 100;

    sections.forEach((section, sectionIndex) => {
      const sectionStartY = currentYPos;
      currentYPos += sectionOffsetY + itemOffsetY * section.items.length;

      const sectionId = `section-${index}-${sectionIndex}`;
      newNodes.push({
        id: sectionId,
        data: { label: section.title },
        position: { x: 500, y: sectionStartY },
        style: {
          backgroundColor: '#ffd700',
          border: '2px solid #000',
          padding: '10px',
        },
      });

      newEdges.push({
        id: `edge-root-${sectionId}`,
        source: `root-${index}`,
        target: sectionId,
        type: 'smoothstep',
        animated: true,
        style: { strokeWidth: 2, stroke: '#007BFF', strokeDasharray: '5 5' },
      });

      const halfItems = Math.ceil(section.items.length / 2);

      section.items.forEach((item, itemIndex) => {
        const isLeft = itemIndex < halfItems;
        const itemXPos = isLeft ? 300 : 700;
        const itemYPos = sectionStartY + itemOffsetY * (itemIndex % halfItems);

        const itemId = `item-${index}-${sectionIndex}-${itemIndex}`;
        newNodes.push({
          id: itemId,
          data: { label: item },
          position: { x: itemXPos, y: itemYPos },
          style: {
            backgroundColor: '#ffffcc',
            border: '2px solid #000',
            borderRadius: '5px',
            padding: '10px',
          },
        });

        newEdges.push({
          id: `edge-${sectionId}-${itemId}`,
          source: sectionId,
          target: itemId,
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2, stroke: '#007BFF', strokeDasharray: '5 5' },
        });
      });
    });

    return { nodes: newNodes, edges: newEdges };
  };

  const processResumes = async () => {
    setLoading(true);
    try {
      const resumeObjects = splitResumes(extractedText);
      const newFlowcharts = [];

      for (let i = 0; i < resumeObjects.length; i++) {
        const { resume } = resumeObjects[i];
        const employeeName = await fetchEmployeeName(resume);
        const roleTitle = await fetchRoleForResume(resume);
        const roadmapData = await fetchRoadmap(roleTitle);
        const roadmapSections = parseRoadmapData(roadmapData);
        const { nodes, edges } = generateFlowchart(
          roadmapSections,
          roleTitle,
          i
        );
        newFlowcharts.push({ employeeName, role: roleTitle, nodes, edges });
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
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        paddingBottom: '100px',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5rem',
          color: '#333',
        }}
      >
        Generate Roadmaps
      </h1>

      <button
        onClick={processResumes}
        disabled={loading || !extractedText}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          border: '2px solid #007BFF',
          backgroundColor: '#007BFF',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'background-color 0.3s ease',
          marginBottom: '20px',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {loading ? 'Generating...' : 'Generate Roadmaps'}
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '30px',
        }}
      >
        {flowcharts.map((flowchart, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: activeTab === index ? '#007BFF' : '#fff',
              color: activeTab === index ? '#fff' : '#007BFF',
              border: '2px solid #007BFF',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {flowchart.employeeName} {/* Show employee name */}
          </button>
        ))}
      </div>

      {activeTab !== null && flowcharts[activeTab] && (
        <div
          style={{
            height: '600px',
            width: '100%',
            marginTop: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '10px',
              fontSize: '1.5rem',
              color: '#333',
            }}
          >
            Roadmap for {flowcharts[activeTab].role}{' '}
            {/* Display role in roadmap */}
          </h2>
          <ReactFlow
            nodes={flowcharts[activeTab].nodes}
            edges={flowcharts[activeTab].edges}
            fitView
            style={{ border: '2px solid #ddd', borderRadius: '8px' }}
          >
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
