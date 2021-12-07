import Navbar from "./components/Navbar";
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from "./Transaction.module.css";

//context
import { UserContext, UserContextProvider } from './context/userContext';

//API config
import { API } from "./config/api";
import { Navigate } from 'react-router-dom';

function Transaction() {
  let navigate = useNavigate();
  const [state, dispatch] = useContext(UserContext);
  const [datas, setDatas] = useState([]);

  const getTransactions = async () => {
    let response = await API.get(`/transactions/${state.user.id}`);
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
    const dataLocations = dataTable.map(
      elem => {return elem.address}
    )
    
    //console.log(dataLocations)
    setDatas(dataTable);
  }

  useEffect(() => {
    getTransactions();
  }, []);

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

  return (
    <div>
      <Navbar />
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
  );
}

export default Transaction;
