export default function Logo({ className = "w-8 h-8" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fundo do coração */}
            <path
                d="M50 85C50 85 15 65 15 40C15 30 20 20 30 20C40 20 45 30 50 35C55 30 60 20 70 20C80 20 85 30 85 40C85 65 50 85 50 85Z"
                fill="#ea4335"
                stroke="#c5221f"
                strokeWidth="2"
            />

            {/* Pulso/ECG */}
            <path
                d="M25 45 L35 45 L40 35 L45 55 L50 40 L55 50 L60 45 L75 45"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Cruz médica */}
            <g transform="translate(50, 50)">
                <rect x="-3" y="-10" width="6" height="20" fill="white" rx="1"/>
                <rect x="-10" y="-3" width="20" height="6" fill="white" rx="1"/>
            </g>
        </svg>
    );
}
