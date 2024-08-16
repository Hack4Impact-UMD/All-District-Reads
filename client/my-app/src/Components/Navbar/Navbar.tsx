import React, { useState, useEffect } from "react";
import "./Navbar.css";
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
import adrLogo from "../../assets/ADR_web_logo.png";

let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig as FirebaseOptions);
} catch (error) {
  firebaseApp = getApp();
}

const Navbar: React.FC = () => {
  const authContext = useAuth();
  const navigate = useNavigate();
  const [schoolDistrictId, setSchoolDistrictId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await authContext.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
