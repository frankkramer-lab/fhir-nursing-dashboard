import './Sidemenu.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MenuItems} from "../../data/MenuItems";

export default function Sidemenu(props) {

    return (
        <>
            <div className="sidemenu">
                <div className="logo">
                    <h1>FHIR Tool</h1>
                </div>
                <div className="menu">
                    {MenuItems.map((item, index) => {
                            return (
                                <div className={props.activeScreen === index ? "menu-item active" : "menu-item"}
                                     key={index}
                                     onClick={() => props.setActiveScreen(index)}>
                                    <div className="icon">
                                        <FontAwesomeIcon icon={item.icon}/>
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>
            </div>
        </>
    );
}