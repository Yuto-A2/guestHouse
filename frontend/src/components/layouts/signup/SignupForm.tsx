import "./signupform.css";
import Button from "../button/Button";
import { useState } from "react";

type FieldItems = "fname" | "lname" | "email" | "phone_num" | "password" | "confirmPassword";

type Props = {
  onSubmit: (data: FormData) => void;
  fieldItems: FieldItems[];
  text: string;
  defaultValues?: Partial<Record<FieldItems, string>>;
};

export default function SignupForm({ onSubmit, fieldItems, defaultValues, text }: Props) {
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    if (fieldItems.includes("confirmPassword")) {
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    }
    if (fieldItems.includes("confirmPassword")) {
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="cardContainer">
        <div className="cardBox">
          <div className="cardItems">
            {fieldItems.includes("fname") && (
              <>
                <label htmlFor="fname">First Name:</label>
                <input
                  type="text"
                  name="fname"
                  id="fname"
                  defaultValue={defaultValues?.fname}
                  autoComplete="given-name"
                />
              </>
            )}

            {fieldItems.includes("lname") && (
              <>
                <label htmlFor="lname">Last Name:</label>
                <input
                  type="text"
                  name="lname"
                  id="lname"
                  defaultValue={defaultValues?.lname}
                  autoComplete="family-name"
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
                  autoComplete="username"
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
                  autoComplete="tel"
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
                  autoComplete={fieldItems.includes("confirmPassword") ? "new-password" : "current-password"}
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
                  autoComplete="new-password"
                />
              </>
            )}

            {error && <p className="setError">{error}</p>}
            <Button type="submit" text={text} className="header_nav_button" />
          </div>
        </div>
      </div>
    </form>
  );
}
