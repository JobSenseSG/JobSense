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

const TeamAnalysisReport = () => {
  const [loading, setLoading] = useState(true);

  const teamAnalysisData = {
    companyName: "JobSense",
    teamSize: "1-5",
    fundingStage: "Pre-seed",
    industryFocus: "AI/ML",
    objectives:
      "Expand market reach, enhance product features, support enterprise solutions, and achieve financial growth.",
    skillsRecommendation: [
      {
        skill: "Cloud Computing",
        reason:
          "The team lacks expertise in cloud computing, which is essential for scaling AI/ML applications and managing data storage and processing in the cloud.",
        improvementAreas:
          "Upskill in cloud platforms such as AWS, Azure, or Google Cloud, with a focus on AI/ML services.",
      },
      {
        skill: "Advanced Data Analysis",
        reason:
          "With the focus on AI/ML, having advanced data analysis skills is crucial for making sense of large datasets and improving model accuracy.",
        improvementAreas:
          "Consider training in advanced statistics, machine learning algorithms, and tools like TensorFlow or PyTorch.",
      },
      {
        skill: "DevOps for AI/ML",
        reason:
          "Adopting DevOps practices tailored for AI/ML can streamline the development and deployment of machine learning models, ensuring consistency and scalability.",
        improvementAreas:
          "Focus on CI/CD pipelines for AI/ML, containerization using Docker, and orchestration with Kubernetes.",
      },
    ],
    weaknesses: [
      "Limited experience with cloud-based AI/ML services.",
      "Lack of expertise in advanced data analysis techniques.",
      "Inconsistent use of DevOps practices for AI/ML model deployment.",
    ],
    improvementSuggestions: [
      "Organize training sessions on cloud platforms and AI/ML services.",
      "Encourage team members to participate in advanced data analysis workshops.",
      "Implement a standardized DevOps process for AI/ML model deployment.",
    ],
    overallAnalysis:
      "The JobSense team shows promise in AI/ML but needs to address key skill gaps in cloud computing, advanced data analysis, and DevOps for AI/ML. Strengthening these areas will help the team better achieve its growth objectives and enhance its product offerings.",
  };

  useEffect(() => {
    // Simulate loading time for AI analysis
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000); // Adjust time to simulate loading

    return () => clearTimeout(timer);
  }, []);

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
          <strong>Company:</strong> {teamAnalysisData.companyName}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Team Size:</strong> {teamAnalysisData.teamSize}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Funding Stage:</strong> {teamAnalysisData.fundingStage}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Industry Focus:</strong> {teamAnalysisData.industryFocus}
        </Text>
        <Text fontSize="lg" color="gray.800">
          <strong>Objectives:</strong> {teamAnalysisData.objectives}
        </Text>

        <Heading as="h3" size="lg" color="teal.600" pt={6}>
          Recommended Skills
        </Heading>
        <UnorderedList pl={4}>
          {teamAnalysisData.skillsRecommendation.map((rec, index) => (
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
          {teamAnalysisData.weaknesses.map((weakness, index) => (
            <ListItem key={index}>{weakness}</ListItem>
          ))}
        </UnorderedList>

        <Heading as="h3" size="lg" color="orange.600" pt={6}>
          Improvement Suggestions
        </Heading>
        <UnorderedList pl={4}>
          {teamAnalysisData.improvementSuggestions.map((suggestion, index) => (
            <ListItem key={index}>{suggestion}</ListItem>
          ))}
        </UnorderedList>

        <Heading as="h3" size="lg" color="blue.600" pt={6}>
          Overall Analysis
        </Heading>
        <Text fontSize="lg" color="gray.800">
          {teamAnalysisData.overallAnalysis}
        </Text>
      </VStack>
    </Box>
  );
};

export default TeamAnalysisReport;
