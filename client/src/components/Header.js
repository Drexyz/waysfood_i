import './Header.css';
import Navbar from './Navbar';

function Header() {
    

    return (
        <div className="Header">
            <Navbar />
            <div className="head">
                <div className="head-txt">
                    <h3 className="ask">Are You Hungry ?</h3>
                    <h3>Express Home Delivery</h3>
                    <div>
                        <span className="rectangle-head"></span>
                        <span className="detail-head">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span>
                    </div>
                </div>
                <img src="./images/10219 1.svg" alt="pizza"/>
            </div>
        </div>
    )
};

export default Header;