import { Box, Text, Flex } from '@chakra-ui/react';

const InfoBox = ({ icon, text }: { icon: string; text: string }) => {
  return (
    <Flex
      bg="white"
      color="black"
      p={3}
      borderRadius="md"
      boxShadow="lg"
      fontWeight="bold"
      alignItems="center"
      maxWidth="220px"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
      }}
    >
      {/* Icon */}
      <Text
        fontSize="xl"
        mr={3}
        display="inline-block"
        bg="gray.200"
        p={2}
        borderRadius="full"
      >
        {icon}
      </Text>

      {/* Text Content */}
      <Text fontSize="md" color="gray.700" fontWeight="semibold">
        {text}
      </Text>
    </Flex>
  );
};

export default InfoBox;
