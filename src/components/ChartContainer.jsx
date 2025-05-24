import React, {useState} from "react";
import "./ChartContainer.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";

export default function ChartContainer(props) {

    const [overlayVisible, setOverlayVisible] = useState(false);
    return (
        <div style={{gridColumn: `span ${props.columns ?? 1}`}}>
            <div className={`box ${props.active && "active"}`}
                 style={{aspectRatio: `${(props.columns * 1.19) ?? 1}/1`}}
                 onClick={props.onClick}>
                {props.children}
                <div className={"titleOverlay"} style={{visibility: overlayVisible ? "visible" : "hidden"}}>
                    <p>{props.title}</p>
                </div>
                <div className={"titleHover"}
                     onMouseEnter={() => setOverlayVisible(true)}
                     onMouseLeave={() => setOverlayVisible(false)}
                >
                    <p><span><FontAwesomeIcon icon={faEye}/></span> Title</p>
                </div>
            </div>
        </div>
    );
}