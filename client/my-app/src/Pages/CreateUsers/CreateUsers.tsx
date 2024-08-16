import { UserType, canCreateUserType } from "../../types/types";
import "./CreateUsers.css";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import {
  FirebaseApp,
  FirebaseOptions,
  initializeApp,
  getApp,
} from "firebase/app";
import firebaseConfig from "../../config/firebase"; // Make sure to provide the correct path to your Firebase config
import {
  createAdminUser,
  createADRStaffUser,
  createSchoolStaffUser,
} from "../../backend/cloudFunctionCalls";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Components/Auth/AuthProvider";
import Alert from '@mui/material/Alert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../config/firebase";

// Initialize Firebase app
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig as FirebaseOptions);
} catch (error) {
  firebaseApp = getApp(); // If the app is already initialized, get the existing app
}



const CreateUsers: React.FC = () => {
  const authContext = useAuth();
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [availableUserTypes, setAvailableUserTypes] = useState<UserType[] | undefined>();
  const [newUserType, setNewUserType] = useState<UserType>();
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [schoolDistrictId, setSchoolDistrictId] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (!authContext.loading) {
      const role = authContext.token?.claims.role as UserType;
      setCurrentUserType(role);
    }
  }, [authContext.loading, authContext.token?.claims.role]);

  useEffect(() => {
    if (currentUserType) {
      const types = getAvailableUserTypes(currentUserType);
      setAvailableUserTypes(types);
    }
  }, [currentUserType]);

  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        setRegistrationSuccess(false); // Dismiss the alert after 3 seconds
      }, 10000);

      return () => clearTimeout(timer); // Clean up the timeout on component unmount
    }
  }, [registrationSuccess]);


  const getAvailableUserTypes = (role: UserType): UserType[] => {
    switch (role) {
      case UserType.ADRAdmin:
        return [UserType.ADRAdmin, UserType.ADRStaff, UserType.SchoolStaff];
      case UserType.ADRStaff:
        return [UserType.SchoolStaff];
      default:
        return [];
    }
  };

  const getDisplayName = (type: UserType): string => {
    switch (type) {
      case UserType.ADRAdmin:
        return "ADR Admin";
      case UserType.ADRStaff:
        return "ADR Staff";
      case UserType.SchoolStaff:
        return "School Staff";
      default:
        return "";
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRetypePasswordVisibility = () => setShowRetypePassword(!showRetypePassword);

  const handleRegister = async () => {
    // Reset any previous error
    setRegistrationError("");

    // Validate required fields
    if (!newUserType) {
      setRegistrationError("User type is required.");
      return;
    }
    if (!newUserName.trim()) {
      setRegistrationError("Name is required.");
      return;
    }
    if (!registrationEmail.trim()) {
      setRegistrationError("Email is required.");
      return;
    }
    if (!registrationPassword.trim()) {
      setRegistrationError("Password is required.");
      return;
    }
    if (registrationPassword !== retypePassword) {
      setRegistrationError("Passwords do not match.");
      return;
    }
    if (newUserType === UserType.SchoolStaff && !schoolDistrictId.trim()) {
      setRegistrationError("School District is required for School Staff.");
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      const currentUser = auth.currentUser;
      setRegistrationSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const unsubscribe = onAuthStateChanged(auth, () => {});
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registrationEmail,
        registrationPassword
      );

      await auth.updateCurrentUser(currentUser);


      const userId = userCredential.user.uid;
      


      if (newUserType === UserType.ADRAdmin) {
        await createAdminUser(userId, registrationEmail, newUserName);
      } else if (newUserType === UserType.ADRStaff) {
        await createADRStaffUser(userId, registrationEmail, newUserName);
      } else if (newUserType === UserType.SchoolStaff) {
        await createSchoolStaffUser(userId, registrationEmail, newUserName, schoolDistrictId);

        const schoolDistrictRef = doc(db, "schoolDistrictIds", schoolDistrictId);
        const schoolDistrictDoc = await getDoc(schoolDistrictRef);

        if (!schoolDistrictDoc.exists()) {
          await setDoc(schoolDistrictRef, { schoolDistrictId });
        }
      }

      setRegistrationSuccess(true);
      setRegistrationError("");
      setRegistrationEmail("");
      setRegistrationPassword("");
      setRetypePassword("");
      setNewUserName("");
      setSchoolDistrictId("");
      setShowPassword(false); // Reset the visibility to default
      setShowRetypePassword(false);
      setRegistrationSuccess(true);
      unsubscribe();
    } catch (error: any) {
      console.error("Registration error:", error.message);
      setRegistrationError("Registration error: " + error.message);
      setRegistrationSuccess(false);
    }
  };

  return (
    <div className="user-container">
      <div className="user-form-container">
        {registrationSuccess && (
          <Alert severity="success">User Successfully Created!</Alert>
        )}
        {registrationError && (
          <Alert severity="error">{registrationError}</Alert>
        )}
        <img
          src="https://alldistrictreads.org/wp-content/uploads/2023/07/All-District-Reads.png"
          alt="navbar-logo"
          className="adr-logo"
        />
        <h2>Create New User</h2>
        <div className="heading-text">Select new user type</div>

        <div className="userOptions">
          {availableUserTypes?.map((type) => (
            <label key={type} className="userOption">
              <input
                type="radio"
                name="userType"
                value={type}
                checked={newUserType === type}
                onChange={(e) => setNewUserType(e.target.value as UserType)}
              />
              <span>{getDisplayName(type)}</span>
            </label>
          ))}
        </div>

        <div
          className={`name-id ${newUserType !== UserType.SchoolStaff ? 'full-width' : ''}`}
        >
          <input
            type="text"
            placeholder="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="user-input-field"
            required
          />
          {newUserType === UserType.SchoolStaff && (
            <input
              type="text"
              placeholder="School District"
              value={schoolDistrictId}
              onChange={(e) => setSchoolDistrictId(e.target.value)}
              className="user-input-field"
              required
            />
          )}
        </div>

        <input
          type="email"
          placeholder="Email"
          value={registrationEmail}
          onChange={(e) => setRegistrationEmail(e.target.value)}
          className="user-input-field"
          required
        />

        <div className="password-icon">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={registrationPassword}
            onChange={(e) => setRegistrationPassword(e.target.value)}
            className="user-input-field"
            required
          />
          <span className="visibility-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </span>
        </div>

        <div className="password-icon">
          <input
            type={showRetypePassword ? "text" : "password"}
            placeholder="Re-type Password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            className="user-input-field"
            required
          />
          <div className="visibility-icon" onClick={toggleRetypePasswordVisibility}>
            {showRetypePassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </div>
        </div>

        <button onClick={handleRegister}>Create User</button>
      </div>
    </div>
  );
};

export default CreateUsers;
