"use client";
type Props = {
    onClick: () => void;
    text: string;
    className?: string;
}

export default function Button({ onClick, text, className }: Props) {
    return (
        <div>
            <button onClick={onClick} className={className ?? "header_nav_button"}>
                {text}
            </button>
        </div>
    )
}
