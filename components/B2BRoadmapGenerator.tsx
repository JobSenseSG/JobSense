import React, { useState, useEffect } from 'react';
import FlowchartDisplay from './FlowchartDisplay';

interface RoadmapSection {
  title: string;
  items: string[];
}

interface Flowchart {
  employeeName: string;
  role: string;
  roadmapSections: RoadmapSection[];
}

const RoadmapGenerator: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    const text = localStorage.getItem('extractedText') || '';
    console.log('Extracted Text:', text);
    setExtractedText(text);
  }, []);
  useEffect(() => {
    if (flowcharts.length > 0) {
      localStorage.setItem('flowcharts', JSON.stringify(flowcharts));
    }
  }, [flowcharts]);

  useEffect(() => {
    if (activeTab !== null) {
      localStorage.setItem('activeTab', activeTab.toString());
    }
  }, [activeTab]);

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
        return; // Skip empty lines and metadata
      }

      if (line.startsWith('### ')) {
        if (currentSection) {
          sections.push(currentSection); // Push the previous section
        }
        currentSection = {
          title: line.replace('### ', '').trim(),
          items: [], // Initialize items for the new section
        };
      } else if (line.startsWith('- ')) {
        // Detect items in the section
        const item = line.replace('- ', '').trim();
        currentSection?.items.push(item);
      }
    });

    if (currentSection) {
      sections.push(currentSection); // Push the last section
    }

    return sections;
  };

  const processResumes = async () => {
    setLoading(true);
    setFlowcharts([]);
    try {
      const resumeObjects = splitResumes(extractedText);
      for (let i = 0; i < resumeObjects.length; i++) {
        const { resume } = resumeObjects[i];
        const employeeName = await fetchEmployeeName(resume);
        const roleTitle = await fetchRoleForResume(resume);
        const roadmapData = await fetchRoadmap(roleTitle);
        const roadmapSections = parseRoadmapData(roadmapData);

        setFlowcharts((prevFlowcharts) => [
          ...prevFlowcharts,
          { employeeName, role: roleTitle, roadmapSections },
        ]);

        if (activeTab === null) {
          setActiveTab(0);
        }
      }
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

      {/* Render the tab buttons */}
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
            {flowchart.employeeName}
          </button>
        ))}
      </div>

      {/* Render all FlowchartDisplay components */}
      {flowcharts.map((flowchart, index) => {
        return (
          <div
            key={index}
            style={{
              display: activeTab === index ? 'block' : 'none',
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
              Roadmap for {flowchart.role}
            </h2>
            <FlowchartDisplay
              role={flowchart.role}
              roadmapSections={flowchart.roadmapSections}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapGenerator;
