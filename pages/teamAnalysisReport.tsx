import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  VStack,
  Spinner,
  Center,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar'; // Import Sidebar component

// Define TypeScript types for analysis data
interface AnalysisData {
  skillsRecommendation: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  overallAnalysis: string;
}

const TeamAnalysisReport: React.FC = () => {
  const router = useRouter();
  const { analysisData } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [teamAnalysisData, setTeamAnalysisData] = useState<AnalysisData | null>(
    null
  );

  // Determine when to allow the sidebar to shrink based on screen size
  const sidebarFlexShrink = useBreakpointValue({ base: 1, md: 0 });

  useEffect(() => {
    if (analysisData) {
      try {
        const parsedData: AnalysisData = JSON.parse(analysisData as string);
        setTeamAnalysisData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        setLoading(false);
      }
    }
  }, [analysisData]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text fontSize="lg" color="gray.500" ml={4}>
          Loading team analysis report, please wait...
        </Text>
      </Center>
    );
  }

  if (!teamAnalysisData) {
    return <Text>No data available</Text>;
  }

  return (
    <Flex height="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        width="250px"
        flexShrink={sidebarFlexShrink} // Sidebar shrinks only on mobile
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        p={8}
        flexGrow={1} // Allow the main content to take the available space
        bg="gray.50"
        borderRadius="lg"
        boxShadow="lg"
        overflowY="auto" // Ensure that the content scrolls if it overflows
      >
        <VStack spacing={4} align="start">
          <Heading
            as="h1"
            size="xl"
            textAlign="center"
            color="gray.700"
            w="full"
          >
            Team Analysis Report
          </Heading>

          <Heading as="h3" size="lg" color="teal.600" pt={6}>
            Recommended Skills
          </Heading>
          <UnorderedList pl={4}>
            {teamAnalysisData.skillsRecommendation.map((rec, index) => (
              <ListItem key={index} mb={4}>
                {rec}
              </ListItem>
            ))}
          </UnorderedList>

          <Heading as="h3" size="lg" color="red.600" pt={6}>
            Weaknesses
          </Heading>
          <UnorderedList pl={4}>
            {teamAnalysisData.weaknesses.map((weakness, index) => (
              <ListItem key={index}>{weakness}</ListItem>
            ))}
          </UnorderedList>

          <Heading as="h3" size="lg" color="orange.600" pt={6}>
            Improvement Suggestions
          </Heading>
          <UnorderedList pl={4}>
            {teamAnalysisData.improvementSuggestions.map(
              (suggestion, index) => (
                <ListItem key={index}>{suggestion}</ListItem>
              )
            )}
          </UnorderedList>

          <Heading as="h3" size="lg" color="blue.600" pt={6}>
            Overall Analysis
          </Heading>
          <Text fontSize="lg" color="gray.800">
            {teamAnalysisData.overallAnalysis}
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default TeamAnalysisReport;
