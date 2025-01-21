import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "../style/LoginPage.css";


const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !password) {
      setErrorMessage("Username and password are required.");
      return;
    }

    const loginData = { userName, password };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        loginData,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;
      if (data.user && data.user.type === "admin" && userType === "admin") {
        navigate("/admin/update-shift-page");
      } else if (
        data.user &&
        data.user.type !== "admin" &&
        userType === "user"
      ) {
        navigate("/add-shift");
      } else {
        setErrorMessage("Incorrect user type selection.");
      }
    } catch (error) {
      console.error("Error response:", error.response || error.message);
      setErrorMessage(
        error.response?.data?.message ||
        "There was an error. Please try again later."
      );
    }
  };

  return (
    <div className="login-container">
        <div className="logo">
          <div className="fingerprint-circle">
            <span className="logo-letter">INOC</span>
          </div>
          <div className="login-right">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userType">Login As:</label>

          <input type="text" placeholder="Enter Username" required
            value={userName} onChange={(e) => setUserName(e.target.value)}/>

          <input type="password" placeholder="Enter Password"required
            value={password} onChange={(e) => setPassword(e.target.value)}/>

          <button type="submit">Login</button>
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <a href="/" className="forgot-password">Forgot Password?</a>
      </div>
        
      </div>
      

     
    </div>
  );
};

export default LoginPage;