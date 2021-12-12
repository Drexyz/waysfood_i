import Navbar from "./components/Navbar";
import ReactMapGL, { Marker, Source, Layer } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import axios from "axios";
import styles from "./Cart.module.css";
import { Modal } from "react-bootstrap";
import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {io} from 'socket.io-client';
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

import {OrderContext} from "./context/orderContext"

//API config
import { API } from "./config/api";

let socket
function Cart() {
  let navigate = useNavigate();
  const [map, setMap] = useState(false);
  const [map2, setMap2] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [mytransaction, setMytransaction] = useState(null);
  const [orderedMenus, setOrderedMenus] = useContext(OrderContext);
  const [viewport, setViewport] = useState({
    latitude: -6.188638999999984,
    longitude: 106.59311500000001,
    width: "1117px",
    height: "439px",
    zoom: 13,
    bearing: 0,
    pitch: 0,
    dragPan: true,
  });

  //map
  const handleMap = () => setMap(!map);
  const handleMap2 = async () => {
    //route
    const distance = await axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${marker.latitude},${marker.longitude}:${marker2.latitude},${marker2.longitude}/json?instructionsType=text&language=en-US&vehicleHeading=90&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=car&vehicleMaxSpeed=120&vehicleCommercial=false&vehicleEngineType=combustion&key=gq6HXEwy1bzEvXyWmWKb0JabKFCLalu3`);
    //console.log(distance)
    const route = distance.data.routes[0].legs[0].points.map(
      elem => {return [elem.longitude,elem.latitude]}
    )

    //set delivery time -> divide time data by 60 and round it
    setDeliveryTime(Math.round((distance.data.routes[0].summary.travelTimeInSeconds)/60))
    //set route to be draw
    setDataOne({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route
      }
    })
    setMap2(!map2)
  };
  const mapRef = useRef();
  const [marker, setMarker] = useState({
    latitude: viewport.latitude,
    longitude: viewport.longitude,
  });
  const [marker2, setMarker2] = useState({
    latitude: 0,
    longitude: 0,
  });
  const onMarkerDragEnd = useCallback((event) => {
    setMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1],
    });
  }, []);
  const handleViewportChange = useCallback((newViewport) => {
    setMarker(newViewport);
    setViewport(newViewport);
  }, []);
  const handleGeocoderViewportChange = useCallback((newViewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return handleViewportChange({
      ...newViewport,
      ...geocoderDefaultOverrides,
    });
  }, []);
  const [dataOne, setDataOne] = useState({
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [106.58929514724433,-6.190166254607426],
        [106.61876700000002,-6.184036000000002]
      ]
    }
  });

  //get data needed for display
  const getData = async () => {
    try {
      const response = await API.get("/my-profile");
      
      //set location if data vailable
      if (response.data.data.user.location !== null) {
        const coordinate = response.data.data.user.location.split(",");
        setViewport({
          ...viewport,
          latitude: parseFloat(coordinate[0]),
          longitude: parseFloat(coordinate[1]),
        });
        setMarker({
          latitude: parseFloat(coordinate[0]),
          longitude: parseFloat(coordinate[1]),
        });
        //geocoding to get address name
        const location = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parseFloat(
            coordinate[0]
          )}&lon=${parseFloat(coordinate[1])}`
        );
        setLocationName(location.data.display_name);
      }

      if (orderedMenus.subtotal !== 0) {
        const totalPrice = orderedMenus.products.reduce(
          (sum, elem) =>  sum + (elem.qty * elem.price),0
        )
        setSubtotal(totalPrice);
      }

    } catch (error) {
      console.log(error);
    }
  };
  const getTransactions = async () => {
    try {
      const response = await API.get('/my-transactions');

      const currentTransaction = response.data.data.transactions.filter(
        transaction => (transaction.status !== 'success' && transaction.status !== 'cancel')
      )
      const totalQty = currentTransaction[0].order.reduce(
        (sum, elem) => sum + elem.qty,0
      )
      const totalprice = currentTransaction[0].order.reduce(
        (sum, elem) => sum + (elem.qty * elem.price),0
      )
      const transaction = {
        id: currentTransaction[0].id,
        order: currentTransaction[0].order,
        status: currentTransaction[0].status,
        seller: currentTransaction[0].partner,
        qty: totalQty,
        total: totalprice
      }
      setMytransaction(transaction);
      setMarker2({
        latitude: parseFloat(transaction.seller.location.split(',')[0]),
        longitude: parseFloat(transaction.seller.location.split(',')[1])
      })
    } catch (error) {
      console.log(error);
    }
  };
  
  //did mount -> get Profile
  useEffect(() => {
    socket = io('http://localhost:5000')
    getData();
    getTransactions();

    return () => {
      socket.disconnect()
    }
  }, []);

  useEffect(() => {
    socket.on('user transaction', (response) => {
      if (mytransaction !== null) {
        if (response.data.transaction.id === mytransaction.id){
          if (response.data.transaction.status === 'on the way') {
            const updateTransaction = {
              id: mytransaction.id,
              order: mytransaction.order,
              status: response.data.transaction.status,
              seller: mytransaction.seller,
              qty: mytransaction.qty,
              total: mytransaction.total
            }
            setMytransaction(updateTransaction)
          } else {
            setMytransaction(null);
          } 
        }
      }
    })
  }, [mytransaction]);

  //form handle
  const increment = (menuID) => {
    const order = orderedMenus.products.map( elem => {
      if (elem.id === menuID) {
        elem.qty = elem.qty + 1
      }
      return elem
    })
    const total = parseInt(orderedMenus.subtotal) + 1;
    setOrderedMenus({
      type: 'ADD_CART',
      payload: order,
      total
    });
    const totalPrice = orderedMenus.products.reduce(
      (sum, elem) =>  sum + (elem.qty * elem.price),0
    )
    setSubtotal(totalPrice);
  }
  const decrement = (menuID) => {
    let total = 1;
    const order = orderedMenus.products.map( elem => {
      if (elem.id === menuID) {
        if (elem.qty > 1){
          elem.qty = elem.qty - 1
        }
      }
      return elem
    })
    if (orderedMenus.subtotal > 1){
      total = parseInt(orderedMenus.subtotal) - 1;
    }
    setOrderedMenus({
      type: 'ADD_CART',
      payload: order,
      total
    });
    const totalPrice = orderedMenus.products.reduce(
      (sum, elem) =>  sum + (elem.qty * elem.price),0
    )
    setSubtotal(totalPrice);
  }
  const delOrder = (menuID) => {
    let decreasePrice = 0;
    orderedMenus.products.forEach(elem => {
      if (elem.id === menuID){
        decreasePrice = elem.qty * elem.price
      }
    });
    const order = orderedMenus.products.filter( elem => 
      elem.id !== menuID
    )
    const total = order.reduce(
      (sum, elem) =>  sum + parseInt(elem.qty),0
    )
    setOrderedMenus({
      type: 'ADD_CART',
      payload: order,
      total
    });
    const totalPrice = subtotal - decreasePrice;
    setSubtotal(totalPrice);
  }

  //making transaction
  const orderMenu = async () => {
    try{
      let orderMenus = orderedMenus.products.map(menu => {return {id: menu.id, qty:menu.qty}})
      orderMenus = {products: orderMenus}
      //Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      // Convert to string 
      const body = JSON.stringify(orderMenus);

      // insert data to transactions
      const orderTransaction = await API.post('/transaction', body, config);
      
      getTransactions()
      socket.emit("load transactions", orderTransaction.data.data.transactions[0].seller.id)
    } catch (error) {
      console.log(error)
    }
  }
  const finishTransaction = async (finishID) => {
    try{
      //Configuration Content-type
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      //prepare body req
      const success = {
        status: "success"
      }
      const body = JSON.stringify(success);

      const response = await API.patch(`/transaction/${finishID}`, body, config);
      
      //console.log(response)
      socket.emit("load transactions", response.data.data.transaction.seller)
      navigate('/profile');
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Navbar />
    {mytransaction === null ? (
      subtotal === 0 ? (<div><img src="./images/404-your-cart-is-empty.png" 
      alt="empty cart" className={styles.empty}/></div>) : (
      <>
      <Modal show={map} onHide={handleMap}>
        <div className={styles.map}>
          <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            ref={mapRef}
            mapStyle="mapbox://styles/drexyz/ckw69wjm70suf14palzmtx2fo"
            onViewportChange={(viewport) => {
              setViewport(viewport);
            }}
          >
            <Marker
              latitude={marker.latitude}
              longitude={marker.longitude}
              offsetLeft={-20}
              offsetTop={-10}
              draggable
              onDragEnd={onMarkerDragEnd}
            >
              <img
                src="./images/mark.png"
                alt="marker"
                style={{ width: "45px", height: "45px" }}
              />
            </Marker>

            <Geocoder
              mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              mapRef={mapRef}
              onViewportChange={handleGeocoderViewportChange}
              position="top-left"
              marker={false}
              inputValue={`${marker.latitude}, ${marker.longitude}`}
              reverseGeocode={true}
              onResult={(result) => setLocationName(result.result.place_name)}
            />

            <div className={styles.box}>
              <p className={styles.titleBox}>Select delivery location</p>
              <div className={styles.direction}>
                <img src="./images/mark.png" alt="mark" />
                <div className={styles.address}>
                  <p className={styles.addressName}>
                    {locationName.split(",")[0]}
                  </p>
                  <p className={styles.addressDetail}>{locationName}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.btnBox}
                onClick={handleMap}
              >
                Confirm location
              </button>
            </div>
          </ReactMapGL>
        </div>
      </Modal>
      <h3 className={styles.restoName}>Your Order</h3>
      <div className={styles.cart}>
        <form>
          <div className={styles.locationInput}>
            <p>Delivery Location</p>
            <span>
              <input
                type="text"
                value={locationName}
                onChange={() => console.log(locationName)}
                required readOnly
              />
              <button type="button" onClick={handleMap}>
                Select On Map
                <img src="./images/map icon.png" alt="mapIcon" />
              </button>
            </span>
          </div>

          <h5>Review Your Order</h5>
          <div className={styles.lines}>
            <div className={styles.line1} />
            <div className={styles.line2} />
          </div>

          <div className={styles.Order}>
            <div className={styles.menulist}>
              
              {orderedMenus.products.map( orderedMenu => { return(
                <div key={orderedMenu.id}>
                  <div className={styles.menu}>
                    <div className={styles.product}>
                      <img src={orderedMenu.image} alt="menu pict" />
                      <div className={styles.qty}>
                        <p>{orderedMenu.title}</p>
                        <button type="button" onClick={() => decrement(orderedMenu.id)}>-</button>
                        <input type="number" value={orderedMenu.qty} readOnly/>
                        <button type="button" onClick={() => increment(orderedMenu.id)}>+</button>
                      </div>
                    </div>
                    <div className={styles.price}>
                      <p>Rp {orderedMenu.price.toLocaleString('id-ID')}</p>
                      <a>
                        <img src="./images/bin.png" alt="bin" onClick={() => delOrder(orderedMenu.id)}/>
                      </a>
                    </div>
                  </div>
                  <div className={styles.line1} />
                </div>
              )})}
            
            </div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Subtotal</p>
                <p className={styles.priceDetail}>Rp {subtotal.toLocaleString('id-ID')}</p>
              </div>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Qty</p>
                <p className={styles.numberDetail}>{orderedMenus.subtotal}</p>
              </div>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Ongkir</p>
                <p className={styles.priceDetail}>Rp 10.000</p>
              </div>
              <div className={styles.line2} />

              <div className={styles.total}>
                <p>Total</p>
                <p>Rp {(subtotal + 10000).toLocaleString('id-ID')}</p>
              </div>

              <div className={styles.orderBtn}>
                <button type='button' onClick={orderMenu}>Order</button>
              </div>
            </div>
          </div>
        </form>
      </div>
      </>
      )
    ):(<>
      <Modal show={map} onHide={handleMap}>
        <div className={styles.map}>
          <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            ref={mapRef}
            mapStyle="mapbox://styles/drexyz/ckw69wjm70suf14palzmtx2fo"
            onViewportChange={(viewport) => {
              setViewport(viewport);
            }}
          >
            <Marker
              latitude={marker.latitude}
              longitude={marker.longitude}
              offsetLeft={-20}
              offsetTop={-10}
              draggable
              onDragEnd={onMarkerDragEnd}
            >
              <img
                src="./images/mark.png"
                alt="marker"
                style={{ width: "45px", height: "45px" }}
              />
            </Marker>

            <Geocoder
              mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              mapRef={mapRef}
              onViewportChange={handleGeocoderViewportChange}
              position="top-left"
              marker={false}
              inputValue={`${marker.latitude}, ${marker.longitude}`}
              reverseGeocode={true}
              onResult={(result) => setLocationName(result.result.place_name)}
            />

            <div className={styles.box}>
              <p className={styles.titleBox}>Select delivery location</p>
              <div className={styles.direction}>
                <img src="./images/mark.png" alt="mark" />
                <div className={styles.address}>
                  <p className={styles.addressName}>
                    {locationName.split(",")[0]}
                  </p>
                  <p className={styles.addressDetail}>{locationName}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.btnBox}
                onClick={handleMap}
              >
                Confirm location
              </button>
            </div>
          </ReactMapGL>
        </div>
      </Modal>
      <h3 className={styles.restoName}>{mytransaction.seller.fullName}</h3>
      <div className={styles.cart}>
        <form>
          <div className={styles.locationInput}>
            <p>Delivery Location</p>
            <span>
              <input
                type="text"
                value={locationName}
                required readOnly
              />
              <button type="button" onClick={handleMap}>
                Select On Map
                <img src="./images/map icon.png" alt="mapIcon" />
              </button>
            </span>
          </div>

          <h5>Review Your Order</h5>
          <div className={styles.lines}>
            <div className={styles.line1} />
            <div className={styles.line2} />
          </div>

          <div className={styles.Order}>
            <div className={styles.menulist}>
              
              {mytransaction.order.map( orderedMenu => { return(
                <div key={orderedMenu.id}>
                  <div className={styles.menu}>
                    <div className={styles.product}>
                      <img src={'http://localhost:5000/uploads/'+ orderedMenu.image} alt="menu pict" />
                      <div className={styles.qty}>
                        <p>{orderedMenu.title}</p>
                        <input type="number" value={orderedMenu.qty} readOnly/>
                      </div>
                    </div>
                    <div className={styles.price}>
                      <p>Rp {orderedMenu.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className={styles.line1} />
                </div>
              )})}
            
            </div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Subtotal</p>
                <p className={styles.priceDetail}>Rp {mytransaction.total.toLocaleString('id-ID')}</p>
              </div>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Qty</p>
                <p className={styles.numberDetail}>{mytransaction.qty}</p>
              </div>
              <div className={styles.detail}>
                <p className={styles.nameDetail}>Ongkir</p>
                <p className={styles.priceDetail}>Rp 10.000</p>
              </div>
              <div className={styles.line2} />

              <div className={styles.total}>
                <p>Total</p>
                <p>Rp {(mytransaction.total + 10000).toLocaleString('id-ID')}</p>
              </div>

              <div className={styles.orderBtn}>
                <button type='button' onClick={handleMap2}>See How Far ?</button>
              </div>
              <Modal show={map2} onHide={handleMap2}>
                <div className={styles.map}>
                
                  <ReactMapGL
                    {...viewport}
                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    ref={mapRef}
                    mapStyle="mapbox://styles/drexyz/ckw69wjm70suf14palzmtx2fo"
                    onViewportChange={(viewport) => {
                      setViewport(viewport);
                    }}
                  >
                    <Marker
                      latitude={marker.latitude}
                      longitude={marker.longitude}
                      offsetLeft={-20}
                      offsetTop={-10}
                    >
                      <img
                        src="./images/mark.png"
                        alt="marker"
                        style={{ width: "45px", height: "45px" }}
                      />
                    </Marker>

                    <Marker
                      latitude={marker2.latitude}
                      longitude={marker2.longitude}
                      offsetLeft={-20}
                      offsetTop={-10}
                    >
                      <img
                        src="./images/mark.png"
                        alt="marker"
                        style={{ width: "45px", height: "45px" }}
                      />
                    </Marker>
                    
                    <Source id="polylineLayer" type="geojson" data={dataOne}>
                      <Layer
                        id="lineLayer"
                        type="line"
                        source="my-data"
                        layout={{
                          "line-join": "round",
                          "line-cap": "round"
                        }}
                        paint={{
                          "line-color": "rgba(3, 170, 238, 0.5)",
                          "line-width": 5
                        }}
                      />
                    </Source>

                    {mytransaction.status === 'waiting approve' ? (
                      <div className={styles.box2}>
                        <p className={styles.titleBox}>Waiting for the transaction to be approved</p>
                        <div className={styles.direction}>
                          <img src="./images/mark.png" alt="mark" />
                          <div className={styles.address}>
                            <p className={styles.addressName}>
                              {locationName.split(",")[0]}
                            </p>
                            <p className={styles.addressDetail}>{locationName}</p>
                          </div>
                        </div>
                        <div className={styles.deliveryTime}>
                          <p className={styles.timeHeader}>Delivery Times</p>
                          <p className={styles.time}>{deliveryTime} - {deliveryTime + 5} Minutes</p>
                        </div>
                      </div>
                    ):(
                      <div className={styles.box2}>
                        <p className={styles.titleBox}>Driver is On The Way</p>
                        <div className={styles.direction}>
                          <img src="./images/mark.png" alt="mark" />
                          <div className={styles.address}>
                            <p className={styles.addressName}>
                              {locationName.split(",")[0]}
                            </p>
                            <p className={styles.addressDetail}>{locationName}</p>
                          </div>
                        </div>
                        <div className={styles.deliveryTime}>
                          <p className={styles.timeHeader}>Delivery Times</p>
                          <p className={styles.time}>{deliveryTime} - {deliveryTime + 5} Minutes</p>
                        </div>
                        <button type="button" className={styles.btnBox} onClick={() => finishTransaction(mytransaction.id)}>Finished Order</button>
                      </div>
                    )}

                  </ReactMapGL>                
              
                </div>
              </Modal>
            </div>
          </div>
        </form>
      </div>
    </>)}
  </div>);
}

export default Cart;