import React from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import B2CRoadmapGenerator from '../components/B2CRoadmapGenerator';

const RoadmapB2C = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  return (
    <Flex height="100vh" direction="column">
      {/* Top Bar with Back Button */}
      <Box
        bg="white"
        px={6}
        py={4}
        borderBottom="1px solid #E2E8F0"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          colorScheme="blue"
          onClick={handleGoBack}
        >
          Back to Dashboard
        </Button>
        <Text fontSize="xl" fontWeight="bold" color="gray.700">
          Career Roadmap
        </Text>
        <Box width="40px" /> {/* Spacer for alignment */}
      </Box>

      {/* Main Content */}
      <Box flex="1" p={8} bg="gray.50" overflowY="auto">
        <B2CRoadmapGenerator />
      </Box>
    </Flex>
  );
};

export default RoadmapB2C;
