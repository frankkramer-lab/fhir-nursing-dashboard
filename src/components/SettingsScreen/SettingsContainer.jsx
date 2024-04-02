import React from 'react';
import './SettingsContainer.css';
export function SettingsContainer(props) {
    return (
        <div className="settings-container">
            <h2>{props.heading}</h2>
            {props.children}
        </div>
    );
}