import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

// Define TypeScript types for analysis data
interface AnalysisData {
  companyInformation: string;
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
  const [parsedAnalysis, setParsedAnalysis] = useState<{
    companyInformation: string;
    recommendedSkills: string[];
    weaknesses: string[];
    improvementSuggestions: string[];
    overallAnalysis: string;
  } | null>(null);

  useEffect(() => {
    if (analysisData) {
      try {
        const parsedData: AnalysisData = JSON.parse(analysisData as string);
        setTeamAnalysisData(parsedData);

        // Updated parseOverallAnalysis function
        const parseOverallAnalysis = (text: string) => {
          const sections = text
            .split(" ------------ ")
            .map((section) => section.trim());

          if (sections.length >= 5) {
            let [
              companyInformation,
              recommendedSkills,
              weaknesses,
              improvementSuggestions,
              overallAnalysis,
            ] = sections;

            // Remove redundant section titles from section texts
            const removeSectionTitle = (sectionText: string, title: string) => {
              const regex = new RegExp(`^${title}\\s*`, "i");
              return sectionText.replace(regex, "").trim();
            };

            recommendedSkills = removeSectionTitle(
              recommendedSkills,
              "Recommended Skills"
            );
            weaknesses = removeSectionTitle(weaknesses, "Weaknesses");
            improvementSuggestions = removeSectionTitle(
              improvementSuggestions,
              "Improvement Suggestions"
            );

            // Function to split items within a section based on numbering
            const splitSectionItems = (sectionText: string) => {
              return sectionText
                .split(/(?=\d+\.\s)/g) // Split before numbers followed by a dot and space
                .map((item) => item.trim())
                .filter((item) => item !== "");
            };

            return {
              companyInformation: companyInformation || "N/A",
              recommendedSkills: recommendedSkills
                ? splitSectionItems(recommendedSkills)
                : [],
              weaknesses: weaknesses ? splitSectionItems(weaknesses) : [],
              improvementSuggestions: improvementSuggestions
                ? splitSectionItems(improvementSuggestions)
                : [],
              overallAnalysis: overallAnalysis || "N/A",
            };
          } else {
            console.error(
              "Unexpected format: The response text did not split into the expected number of sections."
            );
            return {
              companyInformation: "N/A",
              recommendedSkills: [],
              weaknesses: [],
              improvementSuggestions: [],
              overallAnalysis: "N/A",
            };
          }
        };

        setParsedAnalysis(parseOverallAnalysis(parsedData.overallAnalysis));
        setLoading(false);
      } catch (error) {
        console.error("Error parsing analysis data:", error);
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

  if (!teamAnalysisData || !parsedAnalysis) {
    return <Text>No data available</Text>;
  }

  // Parsing functions for each section
  const parseCompanyInformation = (text: string) => {
    const details: { [key: string]: string } = {};

    // Regular expression to match "Key: Value" pairs
    const regex =
      /(Company Name|Team Size|Funding Stage|Industry Focus|Objectives):\s*/g;
    const parts = text.split(regex).filter((part) => part.trim() !== "");

    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i].trim();
      const value = parts[i + 1] ? parts[i + 1].trim() : "";
      details[key] = value;
    }

    return details;
  };

  const parseRecommendedSkillItem = (itemText: string) => {
    const details: { [key: string]: string } = {};

    // Remove the numbering at the start
    const numberingRegex = /^\d+\.\s*/;
    let text = itemText.replace(numberingRegex, "").trim();

    // Split at the first colon to separate skill name and description
    const firstColonIndex = text.indexOf(":");
    if (firstColonIndex !== -1) {
      details["Skill"] = text.substring(0, firstColonIndex).trim();
      const restText = text.substring(firstColonIndex + 1).trim();

      // Extract 'Reason' and 'Areas to Improve'
      const reasonMatch = restText.match(
        /Reason:\s*(.*?)(Areas to Improve:|$)/s
      );
      if (reasonMatch) {
        details["Description"] = reasonMatch[1].trim();
      }

      const areasMatch = restText.match(/Areas to Improve:\s*(.*)/s);
      if (areasMatch) {
        details["Areas to Improve"] = areasMatch[1].trim();
      }
    } else {
      details["Skill"] = text;
    }

    return details;
  };

  const parseWeaknessItem = (itemText: string) => {
    const details: { [key: string]: string } = {};

    // Remove the numbering at the start
    const numberingRegex = /^\d+\.\s*/;
    let text = itemText.replace(numberingRegex, "").trim();

    // If there's a colon, split into 'Weakness' and 'Description'
    const firstColonIndex = text.indexOf(":");
    if (firstColonIndex !== -1) {
      details["Weakness"] = text.substring(0, firstColonIndex).trim();
      details["Description"] = text.substring(firstColonIndex + 1).trim();
    } else {
      // No colon, so the entire text is the weakness
      details["Weakness"] = text;
    }

    return details;
  };

  const parseImprovementSuggestionItem = (itemText: string) => {
    const details: { [key: string]: string } = {};

    // Remove the numbering at the start
    const numberingRegex = /^\d+\.\s*/;
    let text = itemText.replace(numberingRegex, "").trim();

    // If there's a colon, split into 'Suggestion' and 'Description'
    const firstColonIndex = text.indexOf(":");
    if (firstColonIndex !== -1) {
      details["Suggestion"] = text.substring(0, firstColonIndex).trim();
      details["Description"] = text.substring(firstColonIndex + 1).trim();
    } else {
      // No colon, so the entire text is the suggestion
      details["Suggestion"] = text;
    }

    return details;
  };

  return (
    <Flex height="100vh" width="100vw">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        p={8}
        maxW="800px"
        mx="auto"
        bg="gray.50"
        borderRadius="lg"
        boxShadow="lg"
        flex="1"
        overflowY="auto"
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

          <Heading as="h3" size="lg" color="blue.600" pt={6}>
            Company Information
          </Heading>
          {(() => {
            const companyDetails = parseCompanyInformation(
              parsedAnalysis.companyInformation
            );
            return (
              <Text fontSize="lg" color="gray.800">
               {companyDetails["Company Name"] && (
        <Text fontSize="lg" color="gray.800">
          Company: {companyDetails["Company Name"]}
        </Text>
      )}
      {companyDetails["Team Size"] && (
        <Text fontSize="lg" color="gray.800">
          Team Size: {companyDetails["Team Size"]}
        </Text>
      )}
      {companyDetails["Funding Stage"] && (
        <Text fontSize="lg" color="gray.800">
          Funding Stage: {companyDetails["Funding Stage"]}
        </Text>
      )}
      {companyDetails["Industry Focus"] && (
        <Text fontSize="lg" color="gray.800">
          Industry Focus: {companyDetails["Industry Focus"]}
        </Text>
      )}
      {companyDetails["Objectives"] && (
        <Text fontSize="lg" color="gray.800">
          Objectives: {companyDetails["Objectives"]}
        </Text>
      )}
              </Text>
            );
          })()}

          <Heading as="h3" size="lg" color="teal.600" pt={6}>
            Recommended Skills
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.recommendedSkills.map((skillText, index) => {
              const skillDetails = parseRecommendedSkillItem(skillText);
              return (
                <ListItem key={index} mb={4}>
                  {skillDetails["Skill"] && (
                    <Text fontWeight="bold">
                      Skill: {skillDetails["Skill"]}
                    </Text>
                  )}
                  {skillDetails["Description"] && (
                    <Text>Description: {skillDetails["Description"]}</Text>
                  )}
                  {skillDetails["Reason"] && (
                    <Text>Reason: {skillDetails["Reason"]}</Text>
                  )}
                  {skillDetails["Areas to Improve"] && (
                    <Text>
                      Areas to Improve: {skillDetails["Areas to Improve"]}
                    </Text>
                  )}
                </ListItem>
              );
            })}
          </OrderedList>

          <Heading as="h3" size="lg" color="red.600" pt={6}>
            Weaknesses
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.weaknesses.map((weaknessText, index) => {
              const weaknessDetails = parseWeaknessItem(weaknessText);
              return (
                <ListItem key={index} mb={4}>
                  {weaknessDetails["Weakness"] && (
                    <Text fontWeight="bold">
                      Weakness: {weaknessDetails["Weakness"]}
                    </Text>
                  )}
                  {weaknessDetails["Description"] && (
                    <Text>Description: {weaknessDetails["Description"]}</Text>
                  )}
                </ListItem>
              );
            })}
          </OrderedList>

          <Heading as="h3" size="lg" color="orange.600" pt={6}>
            Improvement Suggestions
          </Heading>
          <OrderedList pl={4}>
            {parsedAnalysis.improvementSuggestions.map(
              (suggestionText, index) => {
                const suggestionDetails = parseImprovementSuggestionItem(
                  suggestionText
                );
                return (
                  <ListItem key={index} mb={4}>
                    {suggestionDetails["Suggestion"] && (
                      <Text fontWeight="bold">
                        Suggestion: {suggestionDetails["Suggestion"]}
                      </Text>
                    )}
                    {suggestionDetails["Description"] && (
                      <Text>
                        Description: {suggestionDetails["Description"]}
                      </Text>
                    )}
                  </ListItem>
                );
              }
            )}
          </OrderedList>

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
