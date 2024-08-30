import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  Text,
  VStack,
  chakra,
  Flex,
} from "@chakra-ui/react";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);


const GradientText = chakra(Text, {
  baseStyle: {
    bgClip: "text",
    bgGradient: "linear(to-r, #6A00F4, #BF00FF, #FF006E)",
    fontWeight: "bold",
    display: "inline",
  },
});

const SignIn: React.FC = () => {

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error("Error signing in:", error.message);
    } else {
      console.log("Redirecting to:", data.url);  // Supabase should handle the redirect
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      bg="#121212"
      color="white"
    >
      <VStack spacing={4}>
        <GradientText fontSize="4xl">Sign in to JobSense</GradientText>
        <Button
          onClick={signInWithGoogle}
          sx={{
            border: "2px solid",
            borderImageSlice: 1,
            borderImageSource: "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
            borderRadius: "12px",
            backgroundColor: "transparent",
            color: "white",
            padding: "0.5rem 1rem",
            fontWeight: "bold",
            transition: "all 0.3s ease-in-out",
            _hover: {
              backgroundColor: "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0px 0px 15px rgba(106, 0, 244, 0.7)",
            },
          }}
        >
          Sign in with Google
        </Button>
      </VStack>
    </Flex>
  );
};

export default SignIn;
