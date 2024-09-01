import React from "react";
import { Box, VStack, Text, Flex, Icon, Divider } from "@chakra-ui/react";
import { FaFileAlt, FaMapSigns } from "react-icons/fa"; // Icons for the options
import { useRouter } from "next/router"; // Import Next.js router

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <Box
      as="nav"
      width="250px"
      height="100vh"
      bg="#5A4FCF" // Updated to match the color in the provided image
      color="white"
      paddingY="4"
      boxShadow="lg"
    >
      <Flex justifyContent="center" marginBottom="8">
        <Text fontSize="2xl" fontWeight="bold">
          JobSense B2B
        </Text>
      </Flex>
      <VStack align="start" spacing="4">
        <Flex
          align="center"
          padding="4"
          width="100%"
          _hover={{ bg: "#7E00FB", cursor: "pointer" }}
          onClick={() => router.push("/teamAnalysisReport")} // Navigate to the Team Analysis Report page
        >
          <Icon as={FaFileAlt} marginRight="4" />
          <Text>Team Analysis</Text> {/* Shortened text */}
        </Flex>

        <Divider borderColor="whiteAlpha.600" width="80%" mx="auto" />

        <Flex
          align="center"
          padding="4"
          width="100%"
          _hover={{ bg: "#7E00FB", cursor: "pointer" }}
          onClick={() => router.push("/roadmap")} // Navigate to the Roadmap page
        >
          <Icon as={FaMapSigns} marginRight="4" />
          <Text>Roadmap</Text>
        </Flex>
      </VStack>
    </Box>
  );
};

export default Sidebar;
