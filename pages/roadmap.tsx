// Roadmap.tsx
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import RoadmapGenerator from '../components/roadmapGenerator';

const Roadmap = () => {
  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box  flex="1" // Ensures the main content takes the remaining space
        p={8}
        bg="gray.50"
        marginLeft={{ base: '0', md: '250px' }} >
        <RoadmapGenerator />
      </Box>
    </Flex>
  );
};

export default Roadmap;
