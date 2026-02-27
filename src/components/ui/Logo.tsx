import Image from 'next/image';

interface LogoProps {
    size?: number;
    className?: string;
    iconClassName?: string;
}

export function Logo({ size = 24, className = "", iconClassName = "" }: LogoProps) {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`} style={{ width: size, height: size }}>
            <Image
                src="/logo_fynance_final.svg"
                alt="Fynance Logo"
                width={size}
                height={size}
                className={`object-contain ${iconClassName}`}
                priority
            />
        </div>
    );
}
