import React from "react";
import "./Navbar.css";
import RequireAdminAuth from "../Auth/RequireAdminAuth/RequireADRAuth";
import adrLogo from "./ADR_web_logo.png";


const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <img
        src={adrLogo}
        alt-img="navbar-logo"
        className="navbar-logo"
      ></img>
      <div className="navbar-links">
        <a href="/library" className="nav-link">
          LIBRARY
        </a>        
        <a href="/createUsers" className="nav-link">
          CREATE USERS
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
