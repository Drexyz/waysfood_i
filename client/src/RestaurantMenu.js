import Navbar from './components/Navbar';
import React, { useState, useEffect, useContext } from 'react';
import styles from './RestaurantMenu.module.css';
import './components/Header.css';
//import { Dropdown, NavDropdown } from 'react-bootstrap';
import { useParams } from "react-router-dom";

import {OrderContext} from "./context/orderContext"

//API config
import { API } from "./config/api";

function RestaurantMenu(){
  const [menus, setMenus] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [orderedMenus, setOrderedMenus] = useContext(OrderContext);
  const {restoId} = useParams();

  //get necessary data
  const getRestaurants = async () => {
      try {
        const response = await API.get(`/user/${restoId}`);
        setRestaurant(response.data.data.fullName);
      } catch (error) {
        console.log(error);
      }
  }
  const getMenus = async () => {
      try{
        const response = await API.get(`/products/${restoId}`);
        setMenus(response.data.data.products);
      } catch (error) {
        console.log(error);
      }
  }

  //did mount -> get data needed
  useEffect(() => {
      getRestaurants();
      getMenus();
  }, []);

  //order menu
  let available = false;
  const addorder = (menu) => {
      //product order template
      const order = orderedMenus.products.map( elem => {
        if (elem.id === menu.id) {
          elem.qty = elem.qty + 1
          available = true
        }
        return elem
      })
      //subtotal template
      let total = parseInt(orderedMenus.subtotal) + 1;
      
      if (!available) {
        order.push({
          id: menu.id, 
          qty: 1,
          title: menu.title,
          price: menu.price,
          image: menu.image
        })
        setOrderedMenus({
          type: 'ADD_CART',
          payload: order,
          total
        });
      } else {
        setOrderedMenus({
          type: 'ADD_CART',
          payload: order,
          total
        });
      }
  }
    
  return(
    <div className={styles.Restaurant}>
      <Navbar />

        <h3>{restaurant}, Menus</h3>
        <div className={styles.menus}>
        
          {menus.map( menu => {
            return(
              <div className={styles.menu} key={menu.id}>
                <img src={menu.image} alt="menu pict" />
                <p className={styles.menuName}>{menu.title}</p>
                <p className={styles.menuPrice}>Rp {menu.price.toLocaleString('id-ID')}</p>
                <button onClick={ () => addorder(menu)}>Order</button>
              </div>
            )
          } )}

        </div>
    </div>
  )
};

export default RestaurantMenu;