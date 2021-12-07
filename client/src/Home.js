import "./App.css";
/* import Navbar from './components/Navbar'; */
import React, { useState, useContext, useEffect } from "react";
import { Modal, Dropdown, NavDropdown, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Transaction.module.css";

import { UserContext } from './context/userContext';

//API config
import { API, setAuthToken } from "./config/api";

function App() {
  let navigate = useNavigate();
  //state
  const [register, setRegister] = useState(false);
  const [login, setLogin] = useState(false);
  const [state, dispatch] = useContext(UserContext);
  const [message, setMessage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [popRestaurants, setPopRestaurants] = useState([]);
  const [datas, setDatas] = useState([]);

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

      //notification
      if (response.data.status === "success") {
        const alert = (
          <Alert variant="success" className="py-2 mb-0">
            Registration Success
          </Alert>
        );
        setMessage(alert);
      } else {
        const alert = (
          <Alert variant="danger" className="py-1">
            Failed
          </Alert>
        );
        setMessage(alert);
      }
    } catch (error) {
      const alert = (
        <Alert variant="danger" className="py-1">
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
          <Alert variant="success" className="py-2 mb-0">
            Login Success
          </Alert>
        );
        setMessage(alert);
        if (state.user.role === 'partner') {
          getTransactions()
        }
      } else {
        const alert = (
          <Alert variant="danger" className="py-1 mb-0">
            Login Failed
          </Alert>
        );
        setMessage(alert);
      }
    } catch (error) {
      const alert = (
        <Alert variant="danger" className="py-1 mb-0">
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

  //approve & Cancel transactions
  const approveTransaction = async (dataID) => {
    try{
      //Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      //prepare body req
      const status = {
        status: "on the way"
      }
      const body = JSON.stringify(status);

      //update transaction
      await API.patch(`/transaction/${dataID}`, body, config);
      
      //change datas state
      const currentDatas = datas.map(
        elem => {
          if (elem.id === dataID) {
            elem.status = "on the way"
          }
          return elem 
        }
      )
      setDatas(currentDatas);

    } catch (error) {
      console.log(error)
    }
  }
  const cancelTransaction = async (dataID) => {
    try{
      //Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      //prepare body req
      const status = {
        status: "cancel"
      }
      const body = JSON.stringify(status);

      await API.patch(`/transaction/${dataID}`, body, config);
      
      //change datas state
      const currentDatas = datas.map(
        elem => {
          if (elem.id === dataID) {
            elem.status = "cancel"
          }
          return elem 
        }
      )
      setDatas(currentDatas);
    } catch (error) {
      console.log(error)
    }
  }

  //get restaurant
  const getRestaurants = async () => {
    try {
      const response = await API.get('/users');
      
      // get restaurants
      let resto = response.data.data.users.filter(
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
    } catch (error) {
      console.log(error);
    }
  };
  // //get Transactions for partner
  const getTransactions = async () => {
    console.log(state)
    if (state.user.role === 'partner') {
      let response = await API.get(`/transactions/${state.user.id}`);
      if (response.data.status !== 'failed') {
        const dataTable = response.data.data.transactions.map(
          elem => {
            elem.order = elem.order.map(el => {return el.title})
            let products = elem.order.reduce((sum, el) => sum+','+el)
            if (products.length > 25) {
              products = products.slice(0, 22) + '..'; 
            }
            return {
              id: elem.id,
              name: elem.userOrder.fullName,
              address: elem.userOrder.location,
              products,
              status: elem.status
            }
          }
        )
        
        //console.log(dataLocations)
        setDatas(dataTable);
      }
    }
  }

  //did mount -> get users
  useEffect(() => {
    getRestaurants();
    if (state.user.role === 'partner') {
      getTransactions()
    }
  }, []);

  //did update to partner -> get transactions
  useEffect(() => {
    if (state.user.role === 'partner') {
      getTransactions()
    }
  }, [state]);

  return (
    <>
      {message && message}
      {state.user.role === "partner" && state.isLogin ? (
        <div>
          <nav>
            <img src="./images/Icon.svg" className="icon" alt="icon" onClick={() => console.log(state)}/>
            <span className="buttons">
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
                  style={{textDecoration: "none"}}
                >
                  <img
                    src="./images/user.png"
                    className="dropdownPict"
                    alt="profile"
                  />
                  <span className="dropdownText">Profile</span>
                </Link>
                <Link
                  className="dropdownItem"
                  to="addproduct"
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src="./images/add product.png"
                    className="dropdownPict"
                    alt="add product"
                  />
                  <span className="dropdownText">Add Product</span>
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
          </nav> 

          <div>
      <div className={styles.Transaction}>
        <h4>Income Transaction</h4>
        <table>
          <tr className={styles.th}>
            <td className={styles.no}>No</td>
            <td className={styles.name}>Name</td>
            <td className={styles.address}>Address</td>
            <td className={styles.order}>Products Order</td>
            <td className={styles.status}>Status</td>
            <td className={styles.action}>Action</td>
          </tr>
        {datas.map((data, index) => {return(
          <tr key={index}>
            <td>{index+1}</td>
            <td>{data.name}</td>
            <td>Tangerang</td>
            <td>{data.products}</td>
            {data.status === 'waiting approve' ? (
              <>
              <td style={{ color: "#FF9900" }}>Waiting Approve</td>
              <td className={styles.actionTd}>
                <button className={styles.cancelBtn} onClick={() => cancelTransaction(data.id)}>Cancel</button>
                <button className={styles.ApproveBtn} onClick={() => approveTransaction(data.id)}>Approve</button>
              </td>
              </>  
            ):(
              data.status === 'on the way' ? (
              <>
              <td style={{ color: "#00D1FF" }}>On The Way</td>
              <td className={styles.actionTd}>
                <img src="./images/done.png" alt="status pict" />
              </td>
              </>
              ):(
                data.status === 'success' ? (
                <>
                <td style={{ color: "#78A85A" }}>Success</td>
                <td className={styles.actionTd}>
                  <img src="./images/done.png" alt="status pict" />
                </td>
                </>
              ):(
                <>
                <td style={{ color: "#E83939" }}>Cancel</td>
                <td className={styles.actionTd}>
                  <img src="./images/cancel.png" alt="status pict" />
                </td>
                </>
              ))
            )}
          </tr>
        )})}
        </table>
      </div>
    </div>
  
        </div>
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
                      <Link to={popRestaurant.menu}>
                        <img src={popRestaurant.image} alt="icon" />
                      </Link>
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
                      <Link to={restaurant.menu}>
                        <img src={restaurant.image} alt="icon" />
                      </Link>
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
