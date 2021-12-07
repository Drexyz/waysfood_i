import './Main.css';

function Main() {
    return (
        <div className="main">
            <div className="popResto">
                <h4>Popular Restaurant</h4>
                <div className="restaurant">
                    <div>
                        <img src="./images/Burger King.png" alt="icon" />
                        <p>Burger King</p>
                    </div>
                    <div>
                        <img src="./images/Starbucks.png" alt="icon" />
                        <p>Starbucks</p>
                    </div>
                    <div>
                        <img src="./images/KFC.png" alt="icon" />
                        <p>KFC</p>
                    </div>
                    <div>
                        <img src="./images/jco.png" alt="icon" />
                        <p>Jco</p>
                    </div>
                    
                </div>
            </div>
            <div className="nearResto">
                <h4>Restaurant Near You</h4>
                <div className="near-restaurant">
                    <div>
                        <a href="restaurantmenu">
                        <img src="./images/Geprek Bensu.png" alt="icon" />
                        </a>
                        <p>Geprek Bensu</p>
                        <p className="distance">0,2 KM</p>
                    </div>
                    <div>
                        <img src="./images/Nasi Goreng Mas Rony.png" alt="icon" />
                        <p>Nasi Goreng Mas Rony</p>
                        <p className="distance">0,6 KM</p>
                    </div>
                    <div>
                        <img src="./images/Pecel Ayam Prambanan.png" alt="icon" />
                        <p>Pecel Ayam Prambanan</p>
                        <p className="distance">0,6 KM</p>
                    </div>
                    <div>
                        <img src="./images/Kopi Kenangan.png" alt="icon" />
                        <p>Kopi Kenangan</p>
                        <p className="distance">1,6 KM</p>
                    </div>
                    
                </div>
            </div>
            
        </div>
    )
};

export default Main;