import React from "react"
import logo from "../images/logosLine.png";
import "../styles/Banner.scss"

const Banner = () => (
    <section id="banner" className="section-block">
        <div className="container mt-4 mb-4">
            <div className="row content-center">
                <img src={logo}></img>
            </div>
        </div>
    </section>
)

export default Banner