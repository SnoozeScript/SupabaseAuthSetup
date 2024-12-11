import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      // Password strength checks
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      }
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setServerError("");

    // Validate form
    const validationErrors = validateForm();

    // If there are validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Start loading state
    setLoading(true);

    try {
      // Attempt signup with additional metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Store additional user metadata
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
      });

      if (error) {
        // Handle signup error
        setServerError(error.message);
      } else if (data.user) {
        // Optionally, also create a profiles table entry
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
          },
        ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        navigate("/login", {
          state: {
            message: "Account created successfully. Please log in.",
          },
        });
      }
    } catch (err) {
      // Catch any unexpected errors
      setServerError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      // Always stop loading
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <h1>Create Your Account</h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Fields */}
          <div className="name-fields">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Password Fields */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <div className="password-requirements">
              <small>
                Password must be at least 8 characters long and contain: One
                uppercase letter, One lowercase letter and One number
              </small>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Server Error Display */}
          {serverError && (
            <div className="server-error">
              <p>{serverError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-redirect">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
