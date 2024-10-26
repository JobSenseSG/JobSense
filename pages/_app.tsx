import {ChakraProvider} from '@chakra-ui/react';
import {AppProps} from 'next/app';
import {Analytics} from '@vercel/analytics/react';
function MyApp({Component, pageProps}: AppProps) {
    return (
        <ChakraProvider>
            <Component {...pageProps} />
            <Analytics />
        </ChakraProvider>
    );
}

export default MyApp;
// doing some test