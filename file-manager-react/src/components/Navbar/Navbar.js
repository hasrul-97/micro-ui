import React from 'react';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMagnet } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom"

export function Navbar() {
    return (<div>
        <nav className="row navbar navbar-expand-lg navbar-absolute fixed-top bgwhite" id="navbar" style={{ display: "block", zIndex: '10' }}>
            <div className="container-fluid mr-2 ml-2 row">
                <img style={{ width: "160px!important" }} src="https://mindtree.com/themes/custom/mindtree_theme/mindtree-lnt-logo-png.png" alt="mindtree logo" />
                <div className="btn-group">
                    <div className="nav-item">
                        <a data-toggle="dropdown" role="button" name="HomeButton" className="nav-link pr-3 pl-3 color cursor">
                            Hello, User
                    </a>
                        <div className="dropdown-menu dropdown-menu-right marginForBox activeMenu mt-1"
                            style={{ marginTop: '-20px' }} id='homeMenu' aria-labelledby="navbarDropdownMenuLink">
                            <a className="dropdown-item" name="dashboard">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
        <div className="navbar navbar-inverse navbar-fixed-left">
            <ul className="ml-auto mr-auto">
                <li>
                    <Link to="/" className="item">
                        <FontAwesomeIcon icon={faHome} />
                        <p className="font-label">Home</p>
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className="item" >
                        <FontAwesomeIcon icon={faMagnet} />
                        <p className="font-label">Dash</p>
                    </Link>
                </li>
            </ul>
        </div>

    </div>
    );
}