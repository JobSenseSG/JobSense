import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

interface SkillCardProps {
  title: string;
  points: string;
}

const SkillCard: React.FC<SkillCardProps> = ({ title, points }) => {
  return (
    <Box
      bg="white"
      boxShadow="sm"
      borderRadius="md"
      p={5}
      borderWidth="1px"
      borderColor="gray.200"
      width="300px"
    >
      <VStack align="stretch" spacing={3}>
        <Heading size="md" mb={3}>
          {title}
        </Heading>
        <Text fontSize="sm" mb={2}>
          Why Learn It?
        </Text>
        <Text>{points || 'No additional information provided.'}</Text>
        <Button backgroundColor="#7E00FB" color="white" width="full">
          Learn More
        </Button>
      </VStack>
    </Box>
  );
};

export default SkillCard;
