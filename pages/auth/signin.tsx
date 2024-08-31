import { createClient } from "@supabase/supabase-js";
import {
  Box,
  Button,
  Text,
  VStack,
  chakra,
  Flex,
  Input,
  Divider,
} from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa"; // Correct icon for Google

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
      provider: "google",
    });

    if (error) {
      console.error("Error signing in:", error.message);
    } else {
      console.log("Redirecting to:", data.url); // Supabase should handle the redirect
    }
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="#121212"
      color="white"
      overflow="hidden"
    >
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        width="50%"
        height="100%"
        zIndex="2"
        position="relative"
      >
        <GradientText fontSize="4xl" textAlign="center" mb={6}>
          JobSense
        </GradientText>

        <Box
          p={8}
          bg="#1A1A1A"
          borderRadius="md"
          boxShadow="lg"
          width="80%"
          maxWidth="400px"
        >
          <VStack spacing={4} mt={6}>
            <Button
              leftIcon={<FaGoogle />}
              onClick={signInWithGoogle}
              width="100%" // Ensuring button width matches input width
              sx={{
                border: "2px solid",
                borderImageSlice: 1,
                borderImageSource:
                  "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
                borderRadius: "12px",
                backgroundColor: "transparent",
                color: "white",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease-in-out",
                _hover: {
                  backgroundColor:
                    "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
                  color: "white",
                  borderRadius: "12px",
                  boxShadow: "0px 0px 15px rgba(106, 0, 244, 0.7)",
                },
              }}
            >
              Sign in with Google
            </Button>

            <Flex align="center" width="100%">
              <Divider color="gray.600" />
              <Text mx={2} color="gray.500">
                OR
              </Text>
              <Divider color="gray.600" />
            </Flex>

            <Input placeholder="Password" type="password" />
            <Button
              width="100%" // Ensuring button width matches input width
              sx={{
                borderRadius: "12px",
                backgroundColor: "#7E00FB",
                color: "white",
                padding: "0.5rem 1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease-in-out",
                _hover: {
                  backgroundColor:
                    "linear-gradient(to right, #6A00F4, #BF00FF, #FF006E)",
                  color: "white",
                  borderRadius: "12px",
                  boxShadow: "0px 0px 15px rgba(106, 0, 244, 0.7)",
                },
              }}
            >
              Sign in with Credentials
            </Button>
          </VStack>
        </Box>
      </Flex>

      {/* Right Side with Design */}
      <Box
        width="50%"
        height="100%"
        zIndex="1"
        backgroundImage="url('/sign-in-background.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        clipPath="polygon(10% 0%, 100% 0, 100% 100%, 0% 100%)"
      />
    </Flex>
  );
};

export default SignIn;