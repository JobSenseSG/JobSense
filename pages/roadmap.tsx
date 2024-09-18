import React from 'react';
import { Box, Heading, Text, VStack, Flex } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';

const Roadmap = () => {
  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        flex="1" // Ensures the main content takes the remaining space
        p={8}
        bg="gray.50"
        marginLeft={{ base: '0', md: '250px' }} // Adjust for the sidebar width on larger screens
      >
        <VStack align="start" spacing={6}>
          <Heading as="h1" size="xl" color="gray.700">
            Roadmap
          </Heading>
          <Text fontSize="lg" color="gray.800">
            This is the template for the Roadmap page. Here, you can outline the
            steps and milestones for your project or product development. You
            can include timelines, objectives, and key deliverables.
          </Text>

          {/* Example Section */}
          <Box p={4} bg="white" borderRadius="md" boxShadow="md" width="100%">
            <Heading as="h2" size="md" color="teal.600" mb={2}>
              Phase 1: Initial Planning
            </Heading>
            <Text fontSize="md" color="gray.700">
              In this phase, we will focus on gathering requirements, conducting
              market research, and defining the project scope.
            </Text>
          </Box>

          <Box p={4} bg="white" borderRadius="md" boxShadow="md" width="100%">
            <Heading as="h2" size="md" color="teal.600" mb={2}>
              Phase 2: Development
            </Heading>
            <Text fontSize="md" color="gray.700">
              During the development phase, the team will start coding the core
              functionalities and building the product&apos;s backend and
              frontend systems.
            </Text>
          </Box>

          <Box p={4} bg="white" borderRadius="md" boxShadow="md" width="100%">
            <Heading as="h2" size="md" color="teal.600" mb={2}>
              Phase 3: Testing & Deployment
            </Heading>
            <Text fontSize="md" color="gray.700">
              After development, we will move on to testing, fixing bugs, and
              deploying the product to a live environment.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Roadmap;
