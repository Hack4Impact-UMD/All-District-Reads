import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Library from "./Pages/Library/Library";
import { FirebaseOptions, initializeApp, getApps } from "firebase/app";
import Login from "./Pages/Login/Login";
import firebaseConfig from "./config/firebase";
import ReadingAssignment from "./Pages/ReadingSchedule/ReadingAssignment";
import CreateUsers from "./Pages/CreateUsers/CreateUsers";
import { UserType } from "./types/types";
import Navbar from "./Components/Navbar/Navbar";
import RequireADRAuth from "./Components/Auth/RequireAdminAuth/RequireADRAuth";
import RequireSchoolStaffAuth from "./Components/Auth/RequireSchoolStaffAuth/RequireSchoolStaffAuth";
import { AuthProvider, useAuth } from "./Components/Auth/AuthProvider";
import ReadingSchedule from "./Pages/ReadingSchedule/ReadingSchedule";




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
            <RequireADRAuth>
              <Library />
            </RequireADRAuth>
              
          }
        />
        
        <Route path="/schedule/:schoolDistrictId/add" 
          element={
          <RequireSchoolStaffAuth>
            <ReadingAssignment />
          </RequireSchoolStaffAuth>
          } 
        />

        <Route path="/schedule/schoolDistrict/:schoolDistrictId" 
          element={
          <RequireSchoolStaffAuth>
            <ReadingSchedule />
          </RequireSchoolStaffAuth>
          } 
        />

        <Route path="/schedule/schoolDistrict/:schoolDistrictId/assignment/:assignmentId" 
          element={
          <RequireSchoolStaffAuth>
            <ReadingAssignment />
          </RequireSchoolStaffAuth>
          } 
        />

        <Route
          path="/createUsers"
          element={
            <RequireADRAuth>
              <CreateUsers/>
            </RequireADRAuth>
        }
        />
      </Routes>
      </AuthProvider>
      
    </div>
  );
};

export default App;
