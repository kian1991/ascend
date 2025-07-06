'use client';
import { ListAssets } from '../claim/_components/list-assets';
import { Consolidate } from '../onboarding/components/consolidate';

export default function ConsolidatePage() {
    return (
        <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <p className="text-3xl font-thin text-center max-w-48 mx-auto">
                    Lets check where your <strong className="font-bold">assets</strong> are floating around.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center px-6 pt-12 snap-start">
                <ListAssets />
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <p className="text-3xl font-thin text-center max-w-52 mx-auto">
                    Let's make it easy and <span className="font-bold">secure them in one place</span>.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <img src={'/img/ascend.png'} alt="Ascend Logo" className="w-64 mb-4" />
                <Consolidate />
            </div>
        </div>
    );
}
