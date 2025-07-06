'use client';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Beneficiary, ETHAddress } from '@/zod/schemas';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, ArrowRight, Check, Heart, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CheckInInterval, useAscent, useAscentRegistry } from '@/service/smart-contract';
import { ListAssets } from '@/app/claim/_components/list-assets';
import { Consolidate } from './consolidate';
import { ValidateBeneficiaries } from './validate-beneficiaries';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CheckInIllustration from '@/assets/check-in.svg';
import LovedOnes from '@/assets/loved_ones.svg';

const MAX_STEPS = 9;

export function ContractForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const { user } = usePrivy();
    const { push } = useRouter(); // Assuming you have a router to navigate after submission
    const { createAscent, isPending } = useAscentRegistry(); // Assuming useAscent is a custom hook for smart contract interactions
    const [formData, setFormData] = useState<{
        grantor: string;
        beneficiaries: Beneficiary[];
        checkInInterval: CheckInInterval;
    }>({
        grantor: '',
        beneficiaries: [
            {
                name: 'Kian',
                lastName: 'Lütke',
                wallet: '0x4a1db00CEF07772e38D0235A0341164Ec1D63C09'
            },
            {
                name: 'Tim',
                lastName: 'Sigl',
                wallet: '0x06Ed05340de68Dd5BaF10Fc77e296b106De7b2ee'
            }
        ],
        checkInInterval: 2
    });

    useEffect(() => {
        if (user && user.wallet && user.wallet.address) {
            setFormData((prev) => ({
                ...prev,
                grantor: user!.wallet!.address
            }));
        }
    }, [user]);

    const handleNext = () => {
        setCurrentStep((prev) => {
            if (prev < MAX_STEPS) {
                const nextStep = prev + 1;
                containerRef.current?.scrollTo({
                    top: (nextStep - 1) * window.innerHeight,
                    behavior: 'smooth'
                });
                return nextStep;
            }
            return prev; // Prevent going beyond max steps
        });
    };

    const handleBack = () => {
        setCurrentStep((prev) => {
            if (prev > 1) {
                const prevStep = prev - 1;
                containerRef.current?.scrollTo({
                    top: (prevStep - 1) * window.innerHeight,
                    behavior: 'smooth'
                });
                return prevStep;
            }
            return prev; // Prevent going below step 1
        });
    };

    const handleSubmit = () => {
        console.log(formData);
        createAscent(
            formData.grantor as `0x${string}`, // Ensure grantor is a valid ETH address
            formData.beneficiaries.map((b) => b.wallet as `0x${string}`),
            formData.checkInInterval
        );
        setTimeout(() => {
            push('/consolidate');
        }, 4500);
    };

    return (
        <div
            ref={containerRef}
            className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {/* <ScrollProgressBasic> */}

            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <Image
                    width={500}
                    height={500}
                    src={LovedOnes}
                    alt="Loved Ones Illustration"
                    className="inline h-48 mb-4"
                />
                <p className="text-3xl font-thin text-center max-w-48 mx-auto">
                    Now its time to <strong className="font-bold">add your beloved ones.</strong>
                </p>
            </div>
            <div className="h-screen snap-start w-full flex flex-col px-8 py-12  max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-start">Your Beloved Ones</h2>
                <BeneficiaryInput
                    onAdd={(beneficiary) => {
                        setFormData((prev) => {
                            const updatedBeneficiaries = [...prev.beneficiaries, beneficiary];
                            return {
                                ...prev,
                                beneficiaries: updatedBeneficiaries
                            };
                        });
                    }}
                />
                <div className="h-full w-full mt-4">
                    {formData.beneficiaries.length > 0 && (
                        <AnimatedGroup preset="scale" className="flex flex-col gap-2">
                            {formData.beneficiaries.map((beneficiary, index) => (
                                <BeneficiaryCard
                                    key={index}
                                    beneficiary={beneficiary}
                                    onDelete={() => {
                                        setFormData((prev) => {
                                            const updatedBeneficiaries = prev.beneficiaries.filter(
                                                (_, i) => i !== index
                                            );
                                            return {
                                                ...prev,
                                                beneficiaries: updatedBeneficiaries
                                            };
                                        });
                                    }}
                                />
                            ))}
                        </AnimatedGroup>
                    )}
                </div>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <p className="text-3xl font-thin text-center max-w-48 mx-auto">
                    <Image
                        width={500}
                        height={500}
                        src={CheckInIllustration}
                        alt="Check-in Illustration"
                        className="inline h-48 mb-4"
                    />
                    Next, set your personal{' '}
                    <Heart className="inline fill-pink-400 stroke-accent animate-pulse" size={28} /> beat interval.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <h3 className="text-3xl font-thin">I want to check-in every:</h3>
                <select
                    className="select select-lg select-bordered w-24 font-mono my-12"
                    value={formData.checkInInterval}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            checkInInterval: +e.target.value as CheckInInterval
                        }))
                    }
                >
                    <option value={CheckInInterval.SEVEN_DAYS}>7</option>
                    <option value={CheckInInterval.FOURTEEN_DAYS}>14</option>
                    <option value={CheckInInterval.THIRTY_DAYS} defaultChecked>
                        30
                    </option>
                    <option value={CheckInInterval.ONE_EIGHTY_DAYS}>180</option>
                    <option value={CheckInInterval.THREE_SIXTY_FIVE_DAYS}>365</option>
                </select>

                <h3 className="text-3xl font-thin">Days</h3>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <Image
                    width={500}
                    height={500}
                    src={LovedOnes}
                    alt="Loved Ones Illustration"
                    className="inline h-48 mb-4"
                />
                <p className="text-3xl font-thin text-center max-w-52 mx-auto">
                    Almost there! Lets make sure{' '}
                    <strong className="font-bold">only your loved ones have access.</strong>
                </p>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <ValidateBeneficiaries
                    beneficiaries={formData.beneficiaries}
                    grantorWallet={formData.grantor as ETHAddress}
                />
            </div>
            <div className="h-screen flex flex-col justify-center snap-start w-full px-6 mx-auto max-w-lg">
                <h3 className="text-base-content text-3xl font-bold text-center">
                    Please, check your inputs carefully
                </h3>
                <div className="mt-8 w-full flex flex-col gap-1">
                    <div className="text-center flex flex-col items-center">
                        <h4 className="text-lg font-semibold ">Your Address:</h4>
                        <span className="badge badge-soft px-2 font-mono text-[0.7em] ">
                            {formData.grantor || 'Not set'}
                        </span>
                    </div>

                    <h4 className="text-lg font-semibold mt-6">Beneficiaries:</h4>
                    <div className="">
                        {formData.beneficiaries.length > 0 ? (
                            formData.beneficiaries.map((beneficiary, index) => (
                                <BeneficiaryCard beneficiary={beneficiary} key={index} />
                            ))
                        ) : (
                            <span className="text-error-content font-bold bg-error p-6">No beneficiaries added</span>
                        )}
                    </div>
                    <h4 className="text-lg font-semibold mt-6 text-center">
                        <Heart className="inline fill-pink-400 stroke-accent animate-pulse" size={28} /> Check-In
                    </h4>
                    <p className="text-base-content text-3xl text-center">
                        Every
                        <span className="font-bold">
                            {formData.checkInInterval === CheckInInterval.SEVEN_DAYS
                                ? ' 7'
                                : formData.checkInInterval === CheckInInterval.FOURTEEN_DAYS
                                ? ' 14'
                                : formData.checkInInterval === CheckInInterval.THIRTY_DAYS
                                ? ' 30'
                                : formData.checkInInterval === CheckInInterval.ONE_EIGHTY_DAYS
                                ? ' 180'
                                : formData.checkInInterval === CheckInInterval.THREE_SIXTY_FIVE_DAYS
                                ? ' 365'
                                : ' Not set'}
                        </span>{' '}
                        days
                    </p>
                    <button
                        disabled={isPending}
                        className="btn btn-primary mt-8 w-full btn-lg"
                        onClick={() => handleSubmit()}
                    >
                        CONFIRM
                    </button>
                    {/* <button
                        disabled={isPending}
                        className="btn btn-secondary mt-2 w-full btn-lg"
                        onClick={() => handleBack()}
                    >
                        Go Back
                    </button> */}
                </div>
            </div>

            {/* CONTROLS */}
            {/* {currentStep < MAX_STEPS && (
                <div className="fixed w-full left-0 bottom-20 flex items-center justify-between z-20 px-12 py-4">
                    {currentStep > 1 ? (
                        <button className="btn btn-xl btn-circle " onClick={handleBack}>
                            <ArrowLeft />
                        </button>
                    ) : (
                        <div />
                    )}

                    <button className="btn btn-xl btn-circle" onClick={handleNext}>
                        <ArrowRight />
                    </button>
                </div>
            )} */}
        </div>
    );
}

function BeneficiaryCard({ beneficiary, onDelete }: { beneficiary: Beneficiary; onDelete?: () => void }) {
    return (
        <div className="bg-base-200 mb-3 px-4 py-3 rounded-lg w-full relative flex flex-col gap-1">
            {onDelete && (
                <button
                    onClick={() => onDelete()}
                    className="btn btn-sm btn-circle p-1 absolute top-2 right-2 text-primary-content/40"
                >
                    <Trash2 />
                </button>
            )}
            <div>
                <h3 className="text-lg font-semibold flex items-center justify-start gap-3">
                    <span>
                        {beneficiary.name} {beneficiary.lastName}
                    </span>
                    {!onDelete && (
                        <span className="badge badge-accent px-2 text-sm">
                            ZK <Check className="inline" size={16} />
                        </span>
                    )}
                </h3>
            </div>

            <div className="badge badge-soft px-2 text-[.7em] font-mono">{beneficiary.wallet}</div>
        </div>
    );
}

export function BeneficiaryInput({ onAdd }: { onAdd: (beneficiary: Beneficiary) => void }) {
    const [beneficiary, setBeneficiary] = useState<Beneficiary>({
        name: '',
        lastName: '',
        wallet: ''
    });
    // This component should handle the input for a single beneficiary
    // It will receive the beneficiary object and a function to update it

    return (
        <div className="grid grid-cols-2 gap-2 w-full mt-6 p-6  rounded-2xl bg-base-200">
            <input
                type="text"
                value={beneficiary.name}
                onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })}
                placeholder="Name"
                className="input input-secondary input-bordered w-full"
            />
            <input
                type="text"
                value={beneficiary.lastName}
                onChange={(e) => setBeneficiary({ ...beneficiary, lastName: e.target.value })}
                placeholder="Last Name"
                className="input input-secondary input-bordered w-full"
            />
            <input
                type="text"
                value={beneficiary.wallet}
                onChange={(e) => setBeneficiary({ ...beneficiary, wallet: e.target.value })}
                placeholder="0x12345abcdef...."
                className="input input-secondary input-bordered w-full col-span-2" // Full width for wallet input
            />
            <button
                className="btn btn-primary mt-2 col-span-2"
                onClick={() => {
                    onAdd(beneficiary);
                    setBeneficiary({ name: '', lastName: '', wallet: '' }); // Reset after adding
                }}
            >
                Add Beneficiary
            </button>
        </div>
    );
}
