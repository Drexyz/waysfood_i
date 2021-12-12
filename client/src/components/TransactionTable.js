import styles from "./TransactionTable.module.css";
import "../App.css";
import React, { useState, useContext, useEffect } from "react";
import { Dropdown, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {io} from 'socket.io-client';

//context
import { UserContext } from '../context/userContext';

//API config
import { API, setAuthToken } from "../config/api";

let socket;
function TransactionTable() {
  const [state, dispatch] = useContext(UserContext);
  const [datas, setDatas] = useState([]);


  //did mount -> get transactions
  useEffect(() => {
    socket = io('http://localhost:5000')
    if (state.user.role === 'partner') {
      socket.emit("load transactions", state.user.id)
    }
    socket.on('transactions', (response) => {
      if (response.user === state.user.id) {
        //console.log(state)
        const dataTable = response.data.transactions.map(
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
        
        setDatas(dataTable);
      }
    })

    return () => {
      socket.disconnect()
    }
  }, []);

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
      socket.emit("load user transaction", dataID);
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
      socket.emit("load user transaction", dataID);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <nav>
        <img
          src="./images/Icon.svg"
          className="icon"
          alt="icon"
        />
        <span className="buttons">
          <NavDropdown
            id="dropdown-basic"
            title={<img className="avatar" src={state.user.image} alt="avatar" />}
          >
            <Link
              className="dropdownItem"
              to="profile"
              style={{ textDecoration: "none" }}
            >
              <img src="./images/user.png" className="dropdownPict" alt="profile" />
              <span className="dropdownText">Profile</span>
            </Link>
            <Link
              className="dropdownItem"
              to="myproduct"
              style={{ textDecoration: "none" }}
            >
              <img
                src="./images/menus.png"
                className="dropdownPict"
                alt="myproduct"
              />
              <span className="dropdownText">My Product</span>
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
              style={{ padding: 0 }}
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
            {datas.map((data, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.name}</td>
                  <td>Tangerang</td>
                  <td>{data.products}</td>
                  {data.status === "waiting approve" ? (
                    <>
                      <td style={{ color: "#FF9900" }}>Waiting Approve</td>
                      <td className={styles.actionTd}>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => cancelTransaction(data.id)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.ApproveBtn}
                          onClick={() => approveTransaction(data.id)}
                        >
                          Approve
                        </button>
                      </td>
                    </>
                  ) : data.status === "on the way" ? (
                    <>
                      <td style={{ color: "#00D1FF" }}>On The Way</td>
                      <td className={styles.actionTd}>
                        <img src="./images/done.png" alt="status pict" />
                      </td>
                    </>
                  ) : data.status === "success" ? (
                    <>
                      <td style={{ color: "#78A85A" }}>Success</td>
                      <td className={styles.actionTd}>
                        <img src="./images/done.png" alt="status pict" />
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ color: "#E83939" }}>Cancel</td>
                      <td className={styles.actionTd}>
                        <img src="./images/cancel.png" alt="status pict" />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable;