import "./signupform.css";

type Props = {
    onSubmit: (data: FormData) => void;
    fName?: string;
    lName?: string;
    email?: string;
    phone_num?: string;
    password?: string;
    text: string;
}
export default function SignupForm({ onSubmit, fName, lName, email, phone_num, password, text }: Props) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(formData);
    }

    return (
        <form action="" onSubmit={handleSubmit}>
            <div className='cardContainer'>
                <div className="cardBox">
                    <div className="cardItems">
                        <label htmlFor="fname">First Name</label>
                        <input type="text" name="fname" id="fname" defaultValue={fName} />
                        <label htmlFor="lname">Last Name</label>
                        <input type="text" name="lname" id="lname" defaultValue={lName} />
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" defaultValue={email} />
                        <label htmlFor="phone_num">Phone Number</label>
                        <input type="tel" name="phone_num" id="phone_num" defaultValue={phone_num} />
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" defaultValue={password} />
                        {/* <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" defaultValue={password} /> */}
                        <button type="submit">{text}</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

