'use client';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Beneficiary } from '@/zod/schemas';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, ArrowRight, Heart, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

const MAX_STEPS = 5;

export function ContractForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const { user } = usePrivy();
    const [formData, setFormData] = useState<{
        grantor: string;
        beneficiaries: Beneficiary[];
        checkInInterval: 'SEVEN_DAYS' | 'THIRTY_DAYS' | 'SIXTY_DAYS';
    }>({
        grantor: '',
        beneficiaries: [
            {
                name: 'Kian',
                lastName: 'Lütke',
                birthdate: new Date('1991-02-21'),
                wallet: '0x12345abcdef123456789abcdef1234567890'
            }
        ],
        checkInInterval: 'SEVEN_DAYS'
    });

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
        // Logic for handling the next step in the onboarding process
        console.log('Next step in onboarding');
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
        // Logic for handling the back step in the onboarding process
        console.log('Back step in onboarding');
    };

    const handleSubmit = () => {
        // Logic for submitting the contract form
        console.log('Contract form submitted');
    };

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {/* <ScrollProgressBasic> */}
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <p className="text-xl font-bold text-center max-w-48 mx-auto">Now its Time to add your beloved ones.</p>
            </div>
            <div className="h-screen snap-start w-full flex flex-col px-8 py-12">
                <h2 className="text-2xl font-bold">Your Beloved Ones:</h2>
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
                <p className="text-xl font-bold text-center max-w-48 mx-auto">
                    Next, set your personal <Heart className="inline fill-pink-400 stroke-accent animate-pulse" /> Beat
                    interval.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <h3 className="text-2xl font-semibold">I want to chek-in every:</h3>
                <select
                    className="select select-lg select-bordered w-24  font-mono my-12"
                    value={formData.checkInInterval}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            checkInInterval: e.target.value as 'SEVEN_DAYS' | 'THIRTY_DAYS' | 'SIXTY_DAYS'
                        }))
                    }
                >
                    <option value="SEVEN_DAYS">7</option>
                    <option value="THIRTY_DAYS" defaultChecked>
                        30
                    </option>
                    <option value="SIXTY_DAYS">60</option>
                </select>

                <h3 className="text-2xl italic font-semibold">Days</h3>
            </div>
            <div className="h-screen flex flex-col items-start justify-center snap-start px-8 py-12">
                <h3 className="text-base-content text-2xl font-bold">Please, check your inputs carefully</h3>
                <div className="mt-8 w-full flex flex-col gap-1">
                    <h4 className="text-lg font-semibold">Your Address:</h4>
                    <span className="badge badge-outline px-2 font-mono">{user?.wallet?.address || 'Not set'}</span>

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
                    <h4 className="text-lg font-semibold mt-6">Check-in Interval:</h4>
                    <p className="text-base-content">
                        {formData.checkInInterval === 'SEVEN_DAYS'
                            ? 'Every 7 days'
                            : formData.checkInInterval === 'THIRTY_DAYS'
                            ? 'Every 30 days'
                            : 'Every 60 days'}
                    </p>
                </div>
                <button className="btn btn-primary mt-6 w-full btn-lg" onClick={handleSubmit}>
                    Submit Contract
                </button>
            </div>

            {/* CONTROLS */}
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
        </div>
    );
}

function BeneficiaryCard({ beneficiary, onDelete }: { beneficiary: Beneficiary; onDelete?: () => void }) {
    return (
        <div className="bg-secondary/50 p-6 rounded-lg shadow-sm w-full relative flex flex-col gap-1">
            {onDelete && (
                <button
                    onClick={() => onDelete()}
                    className="btn btn-sm btn-circle p-1 absolute top-2 right-2 text-primary-content/40"
                >
                    <Trash2 />
                </button>
            )}
            <div>
                <h3 className="text-lg font-semibold">
                    {beneficiary.name} {beneficiary.lastName}
                </h3>
                <p className="text-sm">Birthdate: {beneficiary.birthdate.toLocaleDateString()}</p>
            </div>

            <div className="badge badge-dash px-2 font-mono">{beneficiary.wallet}</div>
        </div>
    );
}

export function BeneficiaryInput({ onAdd }: { onAdd: (beneficiary: Beneficiary) => void }) {
    const [beneficiary, setBeneficiary] = useState<Beneficiary>({
        name: '',
        lastName: '',
        birthdate: new Date('2005-11-22'), // Default date, can be changed
        wallet: ''
    });
    // This component should handle the input for a single beneficiary
    // It will receive the beneficiary object and a function to update it

    return (
        <div className="grid grid-cols-3 gap-2 w-full mt-6 p-6 bg-accent rounded-2xl">
            <input
                type="text"
                value={beneficiary.name}
                onChange={(e) => setBeneficiary({ ...beneficiary, name: e.target.value })}
                placeholder="Name"
                className="input input-bordered w-full"
            />
            <input
                type="text"
                value={beneficiary.lastName}
                onChange={(e) => setBeneficiary({ ...beneficiary, lastName: e.target.value })}
                placeholder="Last Name"
                className="input input-bordered w-full"
            />
            <DatePicker
                date={beneficiary.birthdate}
                onDateChange={(date) => setBeneficiary({ ...beneficiary, birthdate: date })}
                className="input input-bordered w-full"
            />
            <input
                type="text"
                value={beneficiary.wallet}
                onChange={(e) => setBeneficiary({ ...beneficiary, wallet: e.target.value })}
                placeholder="0x12345abcdef...."
                className="input input-bordered w-full col-span-3" // Full width for wallet input
            />
            <button
                className="btn btn-primary mt-2 col-span-3"
                onClick={() => {
                    onAdd(beneficiary);
                    setBeneficiary({ name: '', lastName: '', birthdate: new Date(), wallet: '' }); // Reset after adding
                }}
            >
                Add Beneficiary
            </button>
        </div>
    );
}
