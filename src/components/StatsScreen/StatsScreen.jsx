import "./StatsScreen.css";
import TestApi from "../testApi";

export default function StatsScreen(props) {
    return (
        <>
            <div className="charts">
                <TestApi/>
            </div>
            <div className="modifiers">
                <h1>Modifiers</h1>
            </div>
        </>
    );
}