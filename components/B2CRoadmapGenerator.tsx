import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import FlowchartDisplay from './FlowchartDisplay';
import { supabase } from '@/utils/supabaseClient';

interface RoadmapSection {
  title: string;
  items: string[];
}

const B2CRoadmapGenerator: React.FC = () => {
  const [roadmapSections, setRoadmapSections] = useState<RoadmapSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'map' | 'outline'>('map');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(roleTitle);

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
      console.error('Error fetching roadmap:', error);
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

      if (line.startsWith('### ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('### ', '').trim(),
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

  const generateRoadmap = async (role: string) => {
    setLoading(true);
    try {
      const roadmapData = await fetchRoadmap(role);
      const parsedSections = parseRoadmapData(roadmapData);
      setRoadmapSections(parsedSections);
    } catch (error) {
      console.error('Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDesiredRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('desired_roles')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching desired role:', error.message);
        return;
      }

      const desiredRoles = data?.desired_roles;
      if (desiredRoles && desiredRoles.length > 0) {
        setRoleTitle(desiredRoles[0]); // use the first desired role
      }
    };

    fetchDesiredRole();
  }, []);

  useEffect(() => {
    generateRoadmap(roleTitle);
  }, [roleTitle]);

  const handleRoleSubmit = () => {
    setIsEditing(false);
    setRoleTitle(tempTitle);
  };

  return (
    <Flex maxW="100%" height="calc(100vh - 80px)">
      {/* Sidebar (Always visible) */}
      <Box
        width="300px"
        bg="white"
        borderRight="1px solid #E2E8F0"
        p={4}
        overflowY="auto"
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Modules
        </Text>
        <VStack align="stretch" spacing={4}>
          {roadmapSections.map((section, index) => (
            <Box key={index} fontSize="md" fontWeight="medium">
              {index + 1}. {section.title}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" p={8} overflowY="auto">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Flex alignItems="center" gap={2}>
            {isEditing ? (
              <>
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  size="sm"
                  width="250px"
                />
                <Button size="sm" colorScheme="blue" onClick={handleRoleSubmit}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  Roadmap for {roleTitle}
                </Text>
                <IconButton
                  aria-label="Edit Role Title"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => setIsEditing(true)}
                />
              </>
            )}
          </Flex>
          <Flex gap={4}>
            <Button
              variant={viewMode === 'outline' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setViewMode('outline')}
            >
              Outline
            </Button>
            <Button
              variant={viewMode === 'map' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setViewMode('map')}
            >
              Map
            </Button>
          </Flex>
        </Flex>

        {loading ? (
          <Text textAlign="center">Generating roadmap...</Text>
        ) : (
          <Box
            mt={4}
            p={6}
            bg="gray.100"
            borderRadius="md"
            boxShadow="md"
            minH="400px"
          >
            {viewMode === 'map' ? (
              <FlowchartDisplay
                role={roleTitle}
                roadmapSections={roadmapSections}
              />
            ) : (
              roadmapSections.map((section, index) => (
                <Box key={index} mb={6}>
                  <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    {section.title}
                  </Text>
                  <Box pl={4}>
                    {section.items.map((item, idx) => (
                      <Text key={idx} fontSize="md" mb={1}>
                        • {item}
                      </Text>
                    ))}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default B2CRoadmapGenerator;
