import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  Flex,
  OrderedList,
  ListItem,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

interface AnalysisData {
  companyInformation: string;
  skillsRecommendation: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  individualEmployeeAnalysis: string[];
  overallAnalysis: string;
}

const TeamAnalysisReport: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { analysisData } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisData | null>(
    null
  );

  // Determine when to allow the sidebar to shrink based on screen size
  const sidebarFlexShrink = useBreakpointValue({ base: 1, md: 0 });

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (!data.session) {
        router.push('/auth/signin');
      } else {
        setUser(data.session.user);
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    // Check if analysisData is available from the query
    if (analysisData) {
      try {
        const parsedData: AnalysisData = JSON.parse(analysisData as string);
        localStorage.setItem('teamAnalysisData', analysisData as string); // Save to localStorage
        setParsedAnalysis(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        setLoading(false);
      }
    } else {
      // If no query data, check localStorage for previously stored data
      const storedData = localStorage.getItem('teamAnalysisData');
      if (storedData) {
        try {
          const parsedData: AnalysisData = JSON.parse(storedData);
          setParsedAnalysis(parsedData);
          setLoading(false);
        } catch (error) {
          console.error('Error parsing stored analysis data:', error);
          setLoading(false);
        }
      } else {
        setLoading(false); // Stop loading even if no data is available
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

  if (!parsedAnalysis) {
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

          {/* Company Information */}
          <Heading as="h3" size="lg" color="blue.600" pt={6}>
            Company Information
          </Heading>
          <Text fontSize="lg" color="gray.800">
            {parsedAnalysis.companyInformation || 'N/A'}
          </Text>

          {/* Recommended Skills */}
          <Heading as="h3" size="lg" color="teal.600" pt={6}>
            Recommended Skills
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.skillsRecommendation.map((skill, index) => (
              <ListItem key={index} mb={4}>
                {skill}
              </ListItem>
            ))}
          </OrderedList>

          {/* Weaknesses */}
          <Heading as="h3" size="lg" color="red.600" pt={6}>
            Weaknesses
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.weaknesses.map((weakness, index) => (
              <ListItem key={index} mb={4}>
                {weakness}
              </ListItem>
            ))}
          </OrderedList>

          {/* Improvement Suggestions */}
          <Heading as="h3" size="lg" color="orange.600" pt={6}>
            Improvement Suggestions
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.improvementSuggestions.map((suggestion, index) => (
              <ListItem key={index} mb={4}>
                {suggestion}
              </ListItem>
            ))}
          </OrderedList>

          {/* Individual Employee Analysis */}
          <Heading as="h3" size="lg" color="purple.600" pt={6}>
            Individual Employee Analysis
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.individualEmployeeAnalysis.map(
              (employeeAnalysis, index) => (
                <ListItem key={index} mb={4}>
                  {employeeAnalysis}
                </ListItem>
              )
            )}
          </OrderedList>

          {/* Overall Analysis */}
          <Heading as="h3" size="lg" color="blue.600" pt={6}>
            Overall Analysis
          </Heading>
          <Text fontSize="lg" color="gray.800">
            {parsedAnalysis.overallAnalysis}
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default TeamAnalysisReport;
