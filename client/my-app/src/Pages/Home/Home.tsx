import { useNavigate } from "react-router-dom";
import "./Home.css";
import { useAuth } from "../../Components/Auth/AuthProvider";
import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import {
  getDocs,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";



const Home = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [schoolDistrictId, setSchoolDistrictId] = useState("");

  const authContext = useAuth();
  useEffect(() => {
    if (!authContext.loading) {
      setUserId(authContext.user.uid);
    }
  }, [authContext.loading]);

  useEffect(() => {
    
  }, [authContext.loading]);

  useEffect(() => {
    const fetchSchoolDistrictId = async () => {
      if (userId) {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSchoolDistrictId(data.schoolDistrictId || "Unknown");
            console.log(schoolDistrictId);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document: ", error);
        }
      }
    };

    fetchSchoolDistrictId();
  }, [userId]);

  const goToLibrary = () => navigate("/library");
  const goToSchedule = () => {
    if (schoolDistrictId) {
      navigate(`/schedule/schoolDistrict/${schoolDistrictId}`);
    } else {
      console.log("School District ID is not available.");
    }
  };
  const goToDashboard = () => navigate("/dashboard");


  return (
    <div className="home-container">
      <div className="top-half">
        <header className="home-header">
          <h1>Welcome Back</h1>
          <nav className="home-nav"></nav>
        </header>
      </div>
      <div className="bottom-half">
        <main className="home-main">
          <section className="home-card" onClick={goToLibrary}>
            <h2>Library of Books</h2>
            <div className="home-icon"></div>
          </section>
          <section className="home-card" onClick={goToSchedule}>
            <h2>Reading Schedule</h2>
            <div className="home-icon"></div>
          </section>
          <section className="home-card" onClick={goToDashboard}>
            <h2>Dashboard</h2>
            <div className="home-icon"></div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
