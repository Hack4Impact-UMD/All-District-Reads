import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./Pages/Home/Home";
import Library from "./Pages/Library/Library";
import { FirebaseOptions, initializeApp, getApps } from "firebase/app";
import Login from "./Pages/Login/Login";
import firebaseConfig from "./config/firebase";
import ReadingSchedule from "./Pages/ReadingSchedule/ReadingSchedule";
import CreateUsers from "./Pages/CreateUsers/CreateUsers";
import { UserType } from "./types/types";
import Navbar from "./Components/Navbar/Navbar";
import RequireAdminAuth from "./Components/Auth/RequireAdminAuth/RequireAdminAuth";
import RequireADRStaffAuth from "./Components/Auth/RequireADRStaffAuth/RequireADRStaffAuth";
import RequireSchoolStaffAuth from "./Components/Auth/RequireSchoolStaffAuth/RequireSchoolStaffAuth";
import { AuthProvider, useAuth } from "./Components/Auth/AuthProvider";
import ReadingScheduleBottom from "./Pages/ReadingSchedule/ReadingScheduleBottom";




if (!getApps().length) {
  initializeApp(firebaseConfig as FirebaseOptions);
}

const App: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="App">
      {location.pathname !== "/" && <Navbar />}
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/library" 
          element={
          //<RequireAdminAuth>
            <Library />
          //</RequireAdminAuth>
          }
        />
        
        <Route path="/schedule/add" 
          element={
          //<RequireSchoolStaffAuth>
            <ReadingSchedule />
          //</RequireSchoolStaffAuth>
          } 
        />

        <Route path="/schedule/schoolDistrict/:schoolDistrictId" 
          element={
          //<RequireSchoolStaffAuth>
            <ReadingScheduleBottom />
          //</RequireSchoolStaffAuth>
          } 
        />

        <Route path="/schedule/schoolDistrict/:schoolDistrictId/assignment/:assignmentId" 
          element={
          //<RequireSchoolStaffAuth>
            <ReadingSchedule />
          //</RequireSchoolStaffAuth>
          } 
        />
        
        <Route path="/home" element={<Home />} />

        <Route
          path="/createUsers"
          element={<CreateUsers/>}
        />
      </Routes>
      </AuthProvider>
      
    </div>
  );
};

export default App;
