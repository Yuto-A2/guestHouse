import SectionTitle from "../components/layouts/title/SectionTitle";
import SignupForm from "../components/layouts/signup/SignupForm";

export default function Signup() {
  const handleSignup = (fd: FormData) => {
    const data = Object.fromEntries(fd.entries()); 

    return fetch("http://localhost:5000/guests", {           
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    .then(async (res) => {
      const msg = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${msg}`);
     
    })
    .catch((err) => {
      console.error(err);
 
    });
  };

  return (
    <>
      <SectionTitle sectionTitle="Create Account" />
      <SignupForm onSubmit={handleSignup} text="Sign Up" fieldItems={["fName", "lName", "email", "phone_num", "password"]} />
    </>
  );
}
