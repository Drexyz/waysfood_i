import "./App.css";
/* import Navbar from './components/Navbar'; */
import React, { useState, useContext, useEffect } from "react";
import { Modal, Dropdown, NavDropdown, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {io} from 'socket.io-client';
//import styles from "./Transaction.module.css";
import TransactionTable from "./components/TransactionTable";

//context
import { UserContext } from './context/userContext';

//API config
import { API, setAuthToken } from "./config/api";

let socket
function App() {
  //state
  const [register, setRegister] = useState(false);
  const [login, setLogin] = useState(false);
  const [state, dispatch] = useContext(UserContext);
  const [message, setMessage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [popRestaurants, setPopRestaurants] = useState([]);

  //register form (state)
  const [regForm, setRegForm] = useState({
    email: "",
    password: "",
    fullName: "",
    gender: "",
    phone: "",
    role: ""
  });
  const { email, password, fullName, gender, phone, role } = regForm;

  //login form (state)
  const [logForm, setLogForm] = useState({
    email: "",
    password: ""
  });
  const { logEmail, logPassword } = logForm;


  const handleRegChange = (e) => {
    setRegForm({
      ...regForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogChange = (e) => {
    setLogForm({
      ...logForm,
      [e.target.name]: e.target.value,
    });
  };

  //register handle
  const handleRegister = async (e) => {
    try {
      e.preventDefault();

      // Create Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      // Convert form data to string 
      const body = JSON.stringify(regForm);

      // Insert data user to database 
      const response = await API.post('/register', body, config);

      //close & empty modal
      setRegister(false);
      setRegForm({           
        email: "",
        password: "",
        fullName: "",
        gender: "",
        phone: "",
        role: ""
      });

      socket.emit("load users")
      //notification
      if (response.data.status === "success") {
        const alert = (
          <Alert variant="success" onClose={() => setMessage(null)} className="py-2 mb-0" dismissible>
            Registration Success
          </Alert>
        );
        setMessage(alert);        
      } else {
        const alert = (
          <Alert variant="danger" onClose={() => setMessage(null)} className="py-1" dismissible>
            Failed
          </Alert>
        );
        setMessage(alert);
      }
    } catch (error) {
      const alert = (
        <Alert variant="danger" onClose={() => setMessage(null)} className="py-1" dismissible>
          Failed
        </Alert>
      );
      setMessage(alert);
      console.log(error);
    }
  };

  //login handle
  const handleLogin = async (e) => {
    try {
      e.preventDefault();

      // Create Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };
      // Convert form data to string 
      const body = JSON.stringify(logForm);

      // Insert data user to database 
      const response = await API.post('/login', body, config);

      //close & empty modal
      setLogin(false);
      setLogForm({ email: "", password: "" });

      //notification & change state
      if (response.data.status === "success") {
        await dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data.user,
        });
        if (localStorage.token) {
          setAuthToken(localStorage.token);
        }

        const alert = (
          <Alert variant="success" onClose={() => setMessage(null)} className="py-2 mb-0" dismissible>
            Login Success
          </Alert>
        );
        setMessage(alert);
        // if (state.user.role === 'partner') {
        //   getTransactions()
        // }
      } else {
        const alert = (
          <Alert variant="danger" onClose={() => setMessage(null)} className="py-1 mb-0" dismissible>
            Login Failed
          </Alert>
        );
        setMessage(alert);
      }
    } catch (error) {
      const alert = (
        <Alert variant="danger" onClose={() => setMessage(null)} className="py-1 mb-0" dismissible>
          Failed
        </Alert>
      );
      setMessage(alert);
      console.log(error);
    }
  };

  //Register modal toggle
  const handRegClose = () => setRegister(false);
  const handReg = () => setRegister(true);

  //login modal toggle
  const handLogClose = () => setLogin(false);
  const handLog = () => setLogin(true);

  //logout
  const logout = () => dispatch({ 
    type: 'LOGOUT',
    payload: '',
  });

  // //get Transactions for partner
  // const getTransactions = () => {
  //   if (state.user.role === 'partner') {
  //     socket.emit("load transactions", state.user.id)
  //   }
  // }

  //did mount -> get users, socket
  useEffect(() => {
    socket = io('http://localhost:5000')
    //get data user & transactions
    socket.emit("load users");
    
    //receive data user
    socket.on("users", (response) => {
      //console.log(response)
      // get restaurants
      let resto = response.data.users.filter(
        restaurant => restaurant.role === 'partner'
      )
      resto = resto.map(
        restaurant => {return { ...restaurant, menu: `/restaurantmenu/${restaurant.id}`}}
      )
      const popResto = resto.filter(
        restaurant => restaurant.id === 7 || restaurant.id === 8 || restaurant.id === 9 || restaurant.id === 10
      )
      const filresto = resto.filter( restaurant => !popResto.includes(restaurant) ) 
      
      setRestaurants(filresto)
      setPopRestaurants(popResto)        
    })

    return () => {
        socket.disconnect()
    }
  }, []);

  return (
    <>
      {message && message}
      {state.user.role === "partner" && state.isLogin ? (
        <TransactionTable/>
      ) : (
        <div>
          <div className="Header">
            <nav>
              <img src="./images/Icon.svg" className="icon" alt="icon" />
              {!state.isLogin ? (
                <span className="buttons">
                  <button onClick={handReg} className="Header-btn">
                    Register
                  </button>
                  <button onClick={handLog} className="Header-btn">
                    Login
                  </button>
                </span>
              ) : (
                <span className="buttons">
                  <Link to={{ pathname: "/cart", isLogin: true }}>
                    <img src="./images/Cart.png" alt="cart" />
                  </Link>
                  <NavDropdown
                    id="dropdown-basic"
                    title={
                      <img
                        className="avatar"
                        src={state.user.image}
                        alt="avatar"
                      />
                    }
                  >
                    <Link
                      className="dropdownItem"
                      to="profile"
                      style={{ textDecoration: "none" }}
                    >
                      {/* <Link to="profile" style={{ textDecoration: 'none' }}> */}
                      <img
                        src="./images/user.png"
                        className="dropdownPict"
                        alt="profile"
                      />
                      <span className="dropdownText">Profil</span>
                    </Link>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      className="dropdownItem"
                      href="#"
                      onClick={logout}
                      style={{padding: 0}}
                    >
                      <img
                        src="./images/logout.png"
                        className="dropdownPict"
                        alt="logout"
                      />
                      <span className="dropdownText">Logout</span>
                    </Dropdown.Item>
                  </NavDropdown>
                </span>
              )}

              {/*//////// Modals ////////*/}
              <Modal show={register} onHide={handRegClose}>
                <Modal.Header>
                  <Modal.Title>Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <form className="login-form" onSubmit={handleRegister}>
                    <input type="email" placeholder="Email" onChange={handleRegChange} value={email} name='email'/>
                    <input type="password" placeholder="Password" onChange={handleRegChange} value={password} name='password'/>
                    <input type="text" placeholder="Full Name" onChange={handleRegChange} value={fullName} name='fullName'/>
                    <input type="text" placeholder="Gender" onChange={handleRegChange} value={gender} name='gender'/>
                    <input type="tel" placeholder="Phone" onChange={handleRegChange} value={phone} name='phone'/>
                    <select onChange={handleRegChange} value={role} name='role'>
                      <option value="" disabled selected hidden>
                        As User :
                      </option>
                      <option value="user">User</option>
                      <option value="partner">Partner</option>
                    </select>
                    <button type='submit'>Register</button>
                  </form>
                </Modal.Body>
                <Modal.Footer>Already have an account ? Klik Here</Modal.Footer>
              </Modal>

              <Modal show={login} onHide={handLogClose}>
                <Modal.Header>
                  <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <form className="login-form" onSubmit={handleLogin}>
                    <input type="email" placeholder="Email"
                      id="email" onChange={handleLogChange} required
                      value={logEmail} name='email'
                    />
                    <input type="password" placeholder="Password" onChange={handleLogChange}
                      value={logPassword} name='password'/>
                    <button type="submit">
                      Login
                    </button>
                  </form>
                </Modal.Body>
                <Modal.Footer>Don't have an account ? Klik Here</Modal.Footer>
              </Modal>
            </nav>
            <div className="head">
              <div className="head-txt">
                <h3 className="ask">Are You Hungry ?</h3>
                <h3>Express Home Delivery</h3>
                <div>
                  <span className="rectangle-head"></span>
                  <span className="detail-head">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s.
                  </span>
                </div>
              </div>
              <img src="./images/10219 1.svg" alt="pizza" />
            </div>
          </div>
          <div className="main">
            <div className="popResto">
              <h4>Popular Restaurant</h4>
              <div className="restaurant">
                {popRestaurants.map(popRestaurant => {
                  return(
                    <div key={popRestaurant.id}>
                      {!state.isLogin ? (
                          <img src={popRestaurant.image} onClick={handLog} 
                          style={{cursor: 'pointer'}} alt="icon" />
                        ) : (
                        <Link to={popRestaurant.menu}>
                          <img src={popRestaurant.image} alt="icon" />
                        </Link>
                      ) }
                      <p>{popRestaurant.fullName}</p>
                    </div>    
                  )
                })}
              </div>
            </div>

            <div className="nearResto">
              <h4>Restaurant Near You</h4>
              <div className="near-restaurant">
                {restaurants.map(restaurant => {
                  return(
                    <div key={restaurant.id}>
                      {!state.isLogin ? (
                        <img src={restaurant.image} onClick={handLog}
                        style={{cursor: 'pointer'}} alt="icon" />
                      ) : (
                        <Link to={restaurant.menu}>
                          <img src={restaurant.image} alt="icon" />
                        </Link>
                      ) }
                      <p>{restaurant.fullName}</p>
                      <p className="distance">0,2 KM</p>
                    </div>    
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
