import './Sidemenu.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MenuItems} from "../../data/MenuItems";
import logo from '../images/Logo_Care_Regio.png'

export default function Sidemenu(props) {

    return (
        <>
            <div className="sidemenu">
                <div className="logo">
                    <img src={logo} alt="Logo von Care Regio"/>
                    <h1>FHIR Nursing Dashboard</h1>
                </div>
                <div className="menu">
                    {MenuItems.map((item, index) => {
                            return (
                                <div className={props.activeScreen === index ? "menu-item active-menu-item" : "menu-item"}
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