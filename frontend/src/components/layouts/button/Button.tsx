"use client";
import "./button.css";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text: string;
    className?: string;
}

export default function Button({ text, className, ...props }: Props) {
    return (
        <div>
            <button className={className ?? "header_nav_button header_nav_button_login"} {...props}>
                {text}
            </button>
        </div>
    )
}
