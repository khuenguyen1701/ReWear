import { useState } from "react";
import "../styles/signup.css";
import { Link, useNavigate } from "react-router-dom";

import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";

import { app } from "./firebase";

const SignUpForm = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear old error message
        setMessage("");

        try {
            const auth = getAuth(app);

            // Create the account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Save their username
            await updateProfile(userCredential.user, {
                displayName: username
            });

            console.log("Account Created");

            // Go to profile after signup
            navigate("/profile");

        } catch (err) {
            console.log(err);

            if (err.code === "auth/email-already-in-use") {
                setMessage("An account with this email already exists.");
            } else if (err.code === "auth/weak-password") {
                setMessage("Password must be at least 6 characters.");
            } else if (err.code === "auth/invalid-email") {
                setMessage("Please enter a valid email.");
            } else {
                setMessage("Could not create account. Please try again.");
            }
        }
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>

                <label htmlFor="username">
                    Username:
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>

                <label htmlFor="email">
                    Email:
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label htmlFor="password">
                    Password:
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <button type="submit">
                    Sign Up
                </button>

                {message && (
                    <p className="signup-message">
                        {message}
                    </p>
                )}

                <p>
                    Already Registered?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default SignUpForm;