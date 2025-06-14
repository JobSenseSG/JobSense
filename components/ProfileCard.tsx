import {
  Box,
  Text,
  Avatar,
  Button,
  Link,
  useColorModeValue,
  chakra,
  VStack,
  Badge,
} from '@chakra-ui/react';

const ProfileCard = ({
  user,
  profileData,
}: {
  user: any;
  profileData: {
    full_name: string;
    goals: string[];
    current_role?: string;
  };
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const GradientText = chakra(Text, {
    baseStyle: {
      bgClip: 'text',
      bgGradient: 'linear(to-r, #7E00FB, #4B0095)',
      fontWeight: 'bold',
      fontSize: 'lg',
    },
  });

  const fullName = profileData.full_name || 'User';
  const email = user?.email || '';
  const currentRole = profileData.current_role || 'Not specified';
  const goals =
    profileData.goals?.length > 0 ? profileData.goals : ['No goals set'];

  return (
    <Box
      p={6}
      bg={bgColor}
      boxShadow="lg"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      textAlign="center"
      transition="all 0.2s ease-in-out"
      _hover={{ boxShadow: 'xl' }}
    >
      <Avatar
        name={fullName}
        size="xl"
        src={user?.user_metadata?.avatar_url || ''}
        mb={4}
        mx="auto"
        border="3px solid #7E00FB"
      />
      <GradientText mb={1}>{fullName}</GradientText>
      <Text fontSize="sm" color="gray.500" mb={3}>
        {email}
      </Text>

      <VStack spacing={1} mb={4}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Current Role:
        </Text>
        <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
          {currentRole}
        </Badge>

        <Text fontSize="sm" fontWeight="medium" color="gray.600" mt={3}>
          Career Goals:
        </Text>
        {goals.map((goal, idx) => (
          <Text key={idx} fontSize="sm" color="gray.700" px={4}>
            {goal}
          </Text>
        ))}
      </VStack>

      <Link href="/profile">
        <Button
          size="sm"
          bg="#7E00FB"
          color="white"
          _hover={{ bg: '#5C00C9' }}
          borderRadius="xl"
          px={6}
          fontWeight="semibold"
          boxShadow="md"
        >
          View / Edit Profile
        </Button>
      </Link>
    </Box>
  );
};

export default ProfileCard;
