import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Template from './template';
import { LogoutFAB } from '@/components/auth/logout-fab';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Ascend',
    description: 'Better Safe Than Sorry.'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang="en" data-theme="pastel">
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
                    <Template>
                        <Providers>
                            <LogoutFAB />
                            <main>{children}</main>
                        </Providers>
                    </Template>
                </body>
            </html>
        </>
    );
}
