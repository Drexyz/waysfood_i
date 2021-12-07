import React, { useContext, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";

import { UserContext } from './context/userContext';

import './index.css';
import Home from './Home';
import Profile from './Profile';
import EditProfile from './EditProfile';
import Cart from './Cart';
import RestaurantMenu from './RestaurantMenu';
import Transaction from './Transaction';
import AddProduct from './AddProduct';

// Get API config & setAuthToken
import { API, setAuthToken } from './config/api';

// Init token on axios every time the app is refreshed here ...
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  //let navigate = useNavigate();

  // Init user context
  const [state, dispatch] = useContext(UserContext);

  //for check user
  const checkUser = async () => {
    try {
      const response = await API.get('/user');

      if (response.status === 404) {
        return dispatch({
          type: 'AUTH_ERROR',
        });
      }

      let payload = response.data.data.user;

      payload.token = localStorage.token;

      dispatch({
        type: 'USER_SUCCESS',
        payload,
      });
    } catch (error) {
      console.log(error);
    }
  };

  //did mount -> check user
  useEffect(() => {
    checkUser();
  }, []);

  return(
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="profile" element={<Profile />}/>
        <Route path="editprofile" element={<EditProfile />} />
        <Route path="cart" element={<Cart />} />
        <Route path="restaurantmenu/:restoId" element={<RestaurantMenu />} />
        <Route path="addproduct" element={<AddProduct />} />
        <Route path="transaction" element={<Transaction />} />
      </Routes>
  )
}

export default App;
