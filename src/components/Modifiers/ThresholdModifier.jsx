import "./ThresholdModifier.css";
import {useState} from "react";

export default function ThresholdModifier(props) {
    const [threshold, setThreshold] = useState(props.threshold);

    function updateThreshold(value) {
        setThreshold(value);
        props.updateThreshold(value);
    }

    return (
        <div id={"threshold-modifier"}>
            <h2>Threshold</h2>
            <div className={"threshold-input-wrapper"}>
                <label htmlFor="threshold">Threshold</label>
                <input className={"threshold-input"} type="number" id="threshold" name="threshold"
                       value={threshold}
                       min={0}
                       onChange={(e) => updateThreshold(e.target.value)}
                />
            </div>
        </div>
    );
}