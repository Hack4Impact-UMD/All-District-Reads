import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  FirebaseApp,
  FirebaseOptions,
  initializeApp,
  getApp,
} from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import adrLogo from "../../assets/ADR_web_logo.png";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import "./Login.css";
import { db } from "../../config/firebase";

// Initialize Firebase app
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig as FirebaseOptions);
} catch (error) {
  firebaseApp = getApp(); // If the app is already initialized, get the existing app
}

function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentPage, setCurrentPage] = useState<"home" | "wrong" | null>(null);
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [schoolDistrictId, setSchoolDistrictId] = useState<string | null>(null);

  const handleLogin = async () => {
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const user = userCredential.user;

      // Retrieve user data from Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserType(userData?.userType || null);
        console.log(userData.userType);
        setSchoolDistrictId(userData?.schoolDistrictId || "Unknown");
        console.log(userData.schoolDistrictId);
      } else {
        setLoginError("User data not found");
      }

      setCurrentPage("home");
      setLoginError("");
      setLoginEmail(""); // Clear email input
      setLoginPassword(""); // Clear password input
    } catch (error: any) {
      setCurrentPage("wrong");
      console.error("Login error:", error.message);
      setLoginError("Login error: " + error.message);
    }
  };

  useEffect(() => {
    if (userType) {
      if (userType === "ADRAdmin" || userType === "ADRStaff") {
        navigate("/library");
      } else if (userType === "SchoolStaff" && schoolDistrictId) {
        navigate(`/schedule/schoolDistrict/${schoolDistrictId}`);
      } else {
        setLoginError("User type not recognized");
      }
    }
  }, [userType, schoolDistrictId, navigate]);

  const handleForgotPassword = async () => {
    const auth = getAuth(firebaseApp);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setResetPasswordMessage("Password reset email sent!");
      setForgotPasswordEmail(""); // Clear the forgot password input field
      setOpenDialog(false); // Close the dialog after sending the email
    } catch (error: any) {
      console.error("Error sending password reset email:", error.message);
      setResetPasswordMessage("Error: " + error.message);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <div>Login Success!</div>;
      case "wrong":
        return <div>Login incorrect</div>;
      default:
        return null;
    }
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <div className="login-outer-container">
      <div className="login-container">
        <div className="image-container">
          <div className="login-image" />
        </div>
        <div className="login-form-container">
          <img src={adrLogo} alt="adr-logo" className="adr-logo-login" />
          <p className="login-heading">Login</p>
          <hr className="separator" />

          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="login-input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="login-input-field"
          />
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          {renderPage()}
          <div className="forgot-password-container">
            <p className="forgot-password-button" onClick={handleDialogOpen}>
              Forgot Password?
            </p>
            {resetPasswordMessage && (
              <p className="reset-password-message">{resetPasswordMessage}</p>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            handleForgotPassword();
          },
        }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To reset your password, please enter your email address here. We will send a password reset link to your email.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="forgotPasswordEmail"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit">Send Email</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Login;
