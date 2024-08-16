import React, { useState, useEffect } from "react";
import "./Navbar.css";
import adrLogo from "./ADR_web_logo.png";
import { useAuth } from "../Auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  FirebaseApp,
  FirebaseOptions,
  initializeApp,
  getApp,
} from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../config/firebase";

// Initialize Firebase app
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig as FirebaseOptions);
} catch (error) {
  firebaseApp = getApp(); // If the app is already initialized, get the existing app
}

const Navbar: React.FC = () => {
  const authContext = useAuth(); // Access the auth context
  const navigate = useNavigate();
  const [schoolDistrictId, setSchoolDistrictId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await authContext.logout(); // Call the logout method from AuthContext
      navigate("/"); // Redirect to the login page after logging out
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigate to the reading schedule
  const handleNavigateToReadingSchedule = async () => {
    const userId = authContext.user?.uid;

    if (!userId) {
      console.error("User ID is undefined.");
      return;
    }

    const firestore = getFirestore(firebaseApp);
    const userDocRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const districtId = userData?.schoolDistrictId || "Unknown";
      setSchoolDistrictId(districtId);

      // Navigate to the reading schedule page with the schoolDistrictId
      if (districtId !== "Unknown") {
        navigate(`/schedule/schoolDistrict/${districtId}`);
      } else {
        console.error("School District ID not found.");
      }
    } else {
      console.error("User document does not exist.");
    }
  };

  return (
    <nav className="navbar">
      <img src={adrLogo} alt="navbar-logo" className="navbar-logo" />
      <div className="navbar-links">
        <a href="/library" className="nav-link">
          LIBRARY
        </a>
        <a href="/createUsers" className="nav-link">
          CREATE USERS
        </a>
        {/* Use onClick to dynamically navigate to the reading schedule */}
        <a className="nav-link" onClick={handleNavigateToReadingSchedule}>
          READING SCHEDULE
        </a>
        <a className="nav-link" onClick={handleLogout}>
          LOG OUT
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
