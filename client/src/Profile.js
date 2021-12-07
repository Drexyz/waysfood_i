import Navbar from "./components/Navbar";
import styles from "./Profile.module.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

//API config
import { API } from "./config/api";

function Profile() {
  const [profile, setProfile] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  //get detail user
  const getUser = async () => {
    try {
      const response = await API.get('/my-profile')
      setProfile(response.data.data.user)

      let respon = null;
      if(response.data.data.user.role === 'user'){
        let mytransactions = await API.get('/my-transactions')
        mytransactions = mytransactions.data.data.transactions.map(
          elem => {
            const price = elem.order.reduce(
              (sum, el) => sum + (el.price * el.qty),0
            )
            return {
            restaurant: elem.partner.fullName,
            date: elem.order_date.split('T')[0],
            price,
            status: elem.status
          }}
        )
        respon = mytransactions
      } else {
        let mytransactions = await API.get(`/transactions/${response.data.data.user.id}`)
        mytransactions = mytransactions.data.data.transactions.map(
          elem => {
            const price = elem.order.reduce(
              (sum, el) => sum + (el.price * el.qty),0
            )
            return {
            restaurant: elem.userOrder.fullName,
            date: elem.order_date.split('T')[0],
            price,
            status: elem.status
          }}
        )
        respon = mytransactions
      }
      setTransaction(respon);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.mainProfile}>
        <div className={styles.myProfile}>
          {profile.role === "partner" ? (<h4>Profile Partner</h4>):(<h4>My Profile</h4>)}
          <div className={styles.infoPerson}>
            <img src={profile.image} alt="Profil" />
            <article>
              <h5>Full Name</h5>
              <p>{profile.fullName}</p>
              <h5>Email</h5>
              <p>{profile.email}</p>
              <h5>Phone</h5>
              <p>{profile.phone}</p>
            </article>
          </div>
          <Link to="/editprofile">
            <button className={styles.editBtn}>Edit Profile</button>
          </Link>
        </div>
        <div className={styles.historyTransaction}>
          {profile.role === "partner" ? (<h4>History Order</h4>):(<h4>History Transaction</h4>)}
          
          {transaction.map(elem =>{
            return(
              <div className={styles.transactionBox}>
                <div className={styles.descTransaction}>
                  <p className={styles.restoName}>{elem.restaurant}</p>
                  <p className={styles.date}>
                    <b>{days[(new Date(elem.date.split('-')[0], elem.date.split('-')[1], elem.date.split('-')[2])).getDay()]}</b>,{' '}
                    {elem.date.split('-')[2]} {months[elem.date.split('-')[1]-1]} {elem.date.split('-')[0]}
                  </p>
                  <p className={styles.total}>Total : Rp {elem.price.toLocaleString('id-ID')}</p>
                </div>
                <div className={styles.statusTransaction}>
                  <img src="./images/icon.svg" alt="icon" />
                  {elem.status === 'success' ? (
                    <div className={styles.status}>Finished</div>
                  ) : (elem.status === 'waiting approve' ? (
                    <div className={styles.statusw}>{elem.status}</div>
                  ) : (elem.status === 'on the way' ? (
                    <div className={styles.statuso}>{elem.status}</div>
                  ) : (
                    <div className={styles.statusc}>Canceled</div>
                  )))}
                </div>
              </div>    
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default Profile;
