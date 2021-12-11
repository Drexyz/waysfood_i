import Navbar from '../components/Navbar';
import styles from './MyProduct.module.css';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
//import { useParams } from "react-router-dom";

//context
import { UserContext } from '../context/userContext';

//API config
import { API } from "../config/api";

function MyProduct(){
  let navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [state, dispatch] = useContext(UserContext);

  const getMenus = async () => {
    try{
      const response = await API.get(`/products/${state.user.id}`);
      setMenus(response.data.data.products);
    } catch (error) {
      console.log(error);
    }
  }

  //did mount -> get data needed
  useEffect(() => {
    if (state.user.role !== 'partner') {
      navigate('/');
    }
    getMenus();
  }, []);

  const deleteProduct = async (productID) => {
    try {
      await API.delete(`/product/${productID}`);
      getMenus();
    } catch (error) {
      console.log(error)
    }
  };

  return(
    <div className={styles.Restaurant}>
      <Navbar />

        <h3>My Menus</h3>
        <div className={styles.menus}>
        
          {menus.map( menu => {
            return(
              <div className={styles.menu} key={menu.id}>
                <img src={menu.image} alt="menu pict" />
                <p className={styles.menuName}>{menu.title}</p>
                <p className={styles.menuPrice}>Rp {menu.price.toLocaleString('id-ID')}</p>
                <button onClick={ () => navigate(`/editproduct/${menu.id}`) }>Edit</button>
                <button style={{color: "#FFFFFF", backgroundColor: "red"}} onClick={() => deleteProduct(menu.id)}>
                  Delete
                </button>
              </div>
            )
          } )}

        </div>
    </div>
  )
}

export default MyProduct;