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
        <html lang="en" data-theme="pastel">
            <head>
                <link rel="icon" href="/img/a.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
                <Template>
                    <Providers>
                        <LogoutFAB />
                        <main className="min-h-screen bg-base-200 grid place-items-center">{children}</main>
                    </Providers>
                </Template>
            </body>
        </html>
    );
}
