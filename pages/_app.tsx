import {ChakraProvider} from '@chakra-ui/react';
import {AppProps} from 'next/app';
import {Analytics} from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function MyApp({Component, pageProps}: AppProps) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        // If user is logged in and on signin page or index, redirect to dashboard
        if (user && (router.pathname === '/auth/signin' || router.pathname === '/')) {
            router.push('/dashboard');
        }
        
        // If user is not logged in and trying to access protected routes, redirect to signin
        if (!user && router.pathname === '/dashboard') {
            router.push('/auth/signin');
        }
    }, [user, loading, router.pathname]);

    return (
        <ChakraProvider>
            <Component {...pageProps} />
            <Analytics />
        </ChakraProvider>
    );
}

export default MyApp;
// doing some test