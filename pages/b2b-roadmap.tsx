// Roadmap.tsx
import React, { useEffect, useState } from 'react';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import RoadmapGenerator from '../components/B2BRoadmapGenerator';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import router from 'next/router';

const Roadmap = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (!data.session) {
        router.push('/auth/signin');
      } else {
        setUser(data.session.user);
      }
    };

    checkUser();
  }, [router]);

  if (!user) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }

  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        flex="1" // Ensures the main content takes the remaining space
        p={8}
        bg="gray.50"
        marginLeft={{ base: '0', md: '250px' }}
      >
        <RoadmapGenerator />
      </Box>
    </Flex>
  );
};

export default Roadmap;
