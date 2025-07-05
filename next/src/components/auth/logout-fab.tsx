'use client';
import { usePrivy } from '@privy-io/react-auth';

export const LogoutFAB = () => {
    const { logout, authenticated } = usePrivy();

    if (!authenticated) return null;

    return (
        <button
            className="btn btn-circle btn-primary fixed bottom-4 right-4 z-50"
            onClick={() => {
                logout();
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-6 6m0 0l6-6m-6 6V3m0 14l-6-6m0 0l6-6m-6 6h5"
                />
            </svg>
        </button>
    );
};
