import "./signupform.css";
import Button from "../button/Button";

type fieldItems = "fName" | "lName" | "email" | "phone_num" | "password" | "confirmPassword";

type Props = {
    onSubmit: (data: FormData) => void;
    fieldItems: fieldItems[];
    text: string;
    defaultValues?: Partial<Record<fieldItems, string>>;
}
export default function SignupForm({ onSubmit, fieldItems, defaultValues, text }: Props) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        onSubmit(formData);
    }

    return (
        <form action="" onSubmit={handleSubmit}>
            <div className='cardContainer'>
                <div className="cardBox">
                    <div className="cardItems">
                        {fieldItems.includes("fName") && (
                            <>
                                <label htmlFor="fname">First Name:</label>
                                <input
                                    type="text"
                                    name="fname"
                                    id="fname"
                                    defaultValue={defaultValues?.fName}
                                />
                            </>
                        )}

                        {fieldItems.includes("lName") && (
                            <>
                                <label htmlFor="lname">Last Name:</label>
                                <input
                                    type="text"
                                    name="lname"
                                    id="lname"
                                    defaultValue={defaultValues?.lName}
                                />
                            </>
                        )}

                        {fieldItems.includes("email") && (
                            <>
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    defaultValue={defaultValues?.email}
                                />
                            </>
                        )}

                        {fieldItems.includes("phone_num") && (
                            <>
                                <label htmlFor="phone_num">Phone Number:</label>
                                <input
                                    type="tel"
                                    name="phone_num"
                                    id="phone_num"
                                    defaultValue={defaultValues?.phone_num}
                                />
                            </>
                        )}

                        {fieldItems.includes("password") && (
                            <>
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    defaultValue={defaultValues?.password}
                                />
                            </>
                        )}

                            {fieldItems.includes("confirmPassword") && (
                            <>
                                <label htmlFor="confirmPassword">Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    defaultValue={defaultValues?.confirmPassword}
                                />
                            </>
                        )}

                        <Button type="submit" text={text} className="header_nav_button"/>
                    </div>
                </div>
            </div>
        </form>
    );
}