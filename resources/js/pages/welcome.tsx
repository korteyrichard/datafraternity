import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);
    const [navOpen, setNavOpen] = useState(false); // Mobile nav state

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close nav on route change or resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setNavOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Head title="dataflowgh - become a data reseller">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white overflow-x-hidden">
                {/* Navigation */}
                <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-blue-900 shadow-lg' 
                        : 'bg-blue-900'
                } border-b border-white/20`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="text-2xl  text-yellow-500 font-black  bg-clip-text ">
                              <img src='/datafraternity.png' alt="Data Fraternity Logo" className="w-60 h-30 mb-4 mx-auto rounded-3xl" />
                            </div>
                            {/* Hamburger for mobile */}
                            <button
                                className="lg:hidden flex items-center px-3 py-2 border rounded text-gray-700 border-gray-300 focus:outline-none"
                                onClick={() => setNavOpen(!navOpen)}
                                aria-label="Toggle navigation"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Desktop nav */}
                            <div className="hidden lg:flex space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={auth.user.role === 'admin' ? route('admin.dashboard') :  route('dashboard')}
                                        className="px-6 py-2 bg-gradient-to-r from-slate-400 to-slate-200 text-slate-500 font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-full hover:bg-yellow-600 hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            Register
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-full hover:bg-yellow-600 hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            Login
                                        </Link>
                                        
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Mobile nav dropdown */}
                        <div className={`lg:hidden transition-all duration-300 ${navOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden`}> 
                            <div className="flex flex-col space-y-2 pb-4">
                                {auth.user ? (
                                    <Link
                                        href={auth.user.role === 'admin' ? route('admin.dashboard') :  route('dashboard')}
                                        className="block px-6 py-3 bg-gradient-to-r from-slate-400 to-slate-200 text-slate-500 font-semibold rounded-full text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                        onClick={() => setNavOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="block px-6 py-3 text-white font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Register
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="block px-6 py-3 text-white font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <a
                                            href="https://chat.whatsapp.com/DHaCb6BlUmP4TVShpNWoKO?mode=ems_wa_t"
                                            className="block px-6 py-3 text-white font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Join Community
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center text-center mt-5 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-500"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-700"></div>
                    </div>
                    
                   
                    

                    <div className="max-w-4xl mx-auto z-10 relative mt-[50px]">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                                Welcome To Data Fraternity
                            </span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-blue-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                             We Prioritize Our Customers Wish And Provide Quality Services To Meet Their Demands
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {auth.user ? (
                                <Link
                                    href={auth.user.role === 'admin' ? route('admin.dashboard') :  route('dashboard')}
                                    className="w-full sm:w-auto px-8 py-4 bg-yellow-500 text-blue-900 font-bold text-lg rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform hover:scale-105"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="w-full sm:w-auto px-8 py-4 bg-yellow-500 text-blue-900 font-bold text-lg rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Start Earning Today
                                    </Link>
                                    
                                </>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}