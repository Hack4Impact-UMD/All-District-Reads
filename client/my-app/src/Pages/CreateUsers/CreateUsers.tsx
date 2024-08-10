// CreateUsers.tsx
import { UserType, canCreateUserType } from "../../types/types";
import "./CreateUsers.css";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
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

// Initialize Firebase app
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig as FirebaseOptions);
} catch (error) {
  firebaseApp = getApp(); // If the app is already initialized, get the existing app
}

const CreateUsers: React.FC = () =>{
  const authContext = useAuth();
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [availableUserTypes, setAvailableUserTypes] = useState<UserType[]|undefined>();
  
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

  const getAvailableUserTypes = (role: UserType): UserType[] => {
    switch (role) {
      case UserType.ADRAdmin:
        return [UserType.ADRAdmin, UserType.ADRStaff, UserType.SchoolStaff];
      case UserType.ADRStaff:
        return [UserType.SchoolStaff];
      default:
        return []; // Empty array if no creation rights
    }
  };

  const getDisplayName = (type: UserType): string => {
    switch (type) {
      case UserType.ADRAdmin:
        return "ADRA Admin";
      case UserType.ADRStaff:
        return "ADR Staff";
      case UserType.SchoolStaff:
        return "School Staff";
      default:
        return "";
    }
  };
   
  const [newUserType, setNewUserType] = useState<UserType>();
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [registrationError, setRegistrationError] = useState(""); // State to store registration error message
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // State to track registration success
  const [currentPage, setCurrentPage] = useState<"home" | "wrong" | null>(null); // State to track current page
  const navigate = useNavigate();

  const handleRegister = async () => {
    const auth = getAuth(firebaseApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registrationEmail,
        registrationPassword
      );

      const userId = userCredential.user.uid;

      if (newUserType === UserType.ADRAdmin) {
        await createAdminUser(userId, registrationEmail);
      } else if (newUserType === UserType.ADRStaff) {
        await createADRStaffUser(userId, registrationEmail);
      } else if (newUserType === UserType.SchoolStaff) {
        await createSchoolStaffUser(userId, registrationEmail);
      }

      setRegistrationSuccess(true);
      setRegistrationError("");
      setRegistrationEmail(""); 
      setRegistrationPassword(""); 
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

        <input
          type="email"
          placeholder="Username or Email"
          value={registrationEmail}
          onChange={(e) => setRegistrationEmail(e.target.value)}
          className="user-input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={registrationPassword}
          onChange={(e) => setRegistrationPassword(e.target.value)}
          className="user-input-field"
        />
        <button onClick={handleRegister}>Create User</button>
        
      </div>
    </div>
  );
};

export default CreateUsers;
