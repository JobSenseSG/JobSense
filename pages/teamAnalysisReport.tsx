import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  VStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const TeamAnalysisReport = () => {
  const [loading, setLoading] = useState(true);
  const [teamAnalysisData, setTeamAnalysisData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch("/api/teamAnalysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(router.query),
        });

        const data = await response.json();
        setTeamAnalysisData(data.analysis);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch team analysis data:", error);
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [router.query]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text fontSize="lg" color="gray.500" ml={4}>
          Analyzing team data, please wait...
        </Text>
      </Center>
    );
  }

  if (!teamAnalysisData) {
    return <Text>No data available</Text>;
  }

  const {
    companyName,
    teamSize,
    fundingStage,
    industryFocus,
    objectives,
    skillsRecommendation,
    weaknesses,
    improvementSuggestions,
    overallAnalysis,
  } = JSON.parse(teamAnalysisData);

  return (
    <Box
      p={8}
      maxW="800px"
      mx="auto"
      bg="gray.50"
      borderRadius="lg"
      boxShadow="lg"
    >
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl" textAlign="center" color="gray.700" w="full">
          Team Analysis Report
        </Heading>
        <Text fontSize="lg" color="gray.800">
          <strong>Company:</strong> {companyName}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Team Size:</strong> {teamSize}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Funding Stage:</strong> {fundingStage}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Industry Focus:</strong> {industryFocus}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Objectives:</strong> {objectives}
        </Text>

        <Heading as="h3" size="lg" color="teal.600" pt={6}>
          Recommended Skills
        </Heading>
        <UnorderedList pl={4}>
          {skillsRecommendation.map((rec: any, index: any) => (
            <ListItem key={index} mb={4}>
              <Text as="strong">{rec.skill}</Text>: {rec.reason}
              <br />
              <Text as="em">Areas to improve:</Text> {rec.improvementAreas}
            </ListItem>
          ))}
        </UnorderedList>

        <Heading as="h3" size="lg" color="red.600" pt={6}>
          Weaknesses
        </Heading>
        <UnorderedList pl={4}>
          {weaknesses.map((weakness: any, index: any) => (
            <ListItem key={index}>{weakness}</ListItem>
          ))}
        </UnorderedList>

        <Heading as="h3" size="lg" color="orange.600" pt={6}>
          Improvement Suggestions
        </Heading>
        <UnorderedList pl={4}>
          {improvementSuggestions.map((suggestion: any, index: any) => (
            <ListItem key={index}>{suggestion}</ListItem>
          ))}
        </UnorderedList>

        <Heading as="h3" size="lg" color="blue.600" pt={6}>
          Overall Analysis
        </Heading>
        <Text fontSize="lg" color="gray.800">
          {overallAnalysis}
        </Text>
      </VStack>
    </Box>
  );
};

export default TeamAnalysisReport;
