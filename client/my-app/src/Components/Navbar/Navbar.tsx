import React from "react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <img
        src="https://alldistrictreads.org/wp-content/uploads/2023/07/All-District-Reads.png"
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
