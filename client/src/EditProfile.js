import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import ReactMapGL, { Marker } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import Navbar from "./components/Navbar";
import { Modal } from "react-bootstrap";
import styles from "./EditProfile.module.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

//API config
import { API } from "./config/api";

function EditProfile() {
  let navigate = useNavigate();
  const [map, setMap] = useState(false);
  const [preview, setPreview] = useState(null);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    image: "",
    email: "",
    phone: "",
    location: "",
  });
  const mapRef = useRef();
  const [locationName, setLocationName] = useState("");
  const [viewport, setViewport] = useState({
    latitude: -6.188638999999984,
    longitude: 106.59311500000001,
    width: "1117px",
    height: "439px",
    zoom: 17,
  });

  ///////mapbox//////////
  const handleMap = () => setMap(!map);
  const [marker, setMarker] = useState({
    latitude: viewport.latitude,
    longitude: viewport.longitude,
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

  /////////form /////////
  const getProfile = async () => {
    try {
      const response = await API.get("/my-profile");
      // Store product data to useState variabel
      setPreview(response.data.data.user.image);
      setForm({
        fullName: response.data.data.user.fullName,
        image: response.data.data.user.image.slice(30,),
        email: response.data.data.user.email,
        phone: response.data.data.user.phone,
        location: response.data.data.user.location,
      });
      setProfile(response.data.data.user);
      
      console.log(response.data.data.user.location)
      //set location if data vailable
      if (response.data.data.user.location !== null) {
        const coordinate = response.data.data.user.location.split(',');
        setViewport({
          ...viewport,
          latitude: parseFloat(coordinate[0]),
          longitude: parseFloat(coordinate[1])
        })
        setMarker({
          latitude: parseFloat(coordinate[0]),
          longitude: parseFloat(coordinate[1])
        })
        //geocoding to get address name
        const location = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parseFloat(coordinate[0])}&lon=${parseFloat(coordinate[1])}`
        )
        setLocationName(location.data.display_name);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "file" ? e.target.files : e.target.value,
    });

    // Create image url for preview
    if (e.target.type === "file") {
      let url = URL.createObjectURL(e.target.files[0]);
      setPreview(url);
    }
  };
  const locChange = () => {
    setForm({
      ...form,
      location: `${viewport.latitude},${viewport.longitude}`,
    })
    setMap(!map)
  }
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      // Configuration
      const config = {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      };

      // Store data with FormData as object
      const formData = new FormData();
      if (typeof(form.image) === 'object') {
        formData.set('image', form?.image[0], form?.image[0]?.name);
      } else {
        formData.set('image', form.image);
      }
      formData.set('fullName', form.fullName);
      formData.set('email', form.email);
      formData.set('phone', form.phone);
      formData.set('location', form.location);

      // Insert product data
      const response = await API.patch(
         `/user/${profile.id}`,
         formData, config );
      console.log(response);

      navigate('/profile');
    } catch (error) {
      console.log(error);
    }
  };

  //did mount -> get Profile
  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.editProfile}>
        <h4>Edit Profile</h4>
        <form className={styles.editProfilForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className={styles.inputName}
            onChange={handleChange}
            defaultValue={profile.fullName}
          />
          <label htmlFor="file" className={styles.inputFile}>
            Attach Image
            <img src="./images/attachFile.png" alt="" />
          </label>
          <input
            type="file"
            hidden
            id="file"
            name="image"
            onChange={handleChange}
            aria-label="File browser example"
          />
          <div id="preview" className={styles.preview}>
            <img
              src={preview}
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                objectFit: "content",
              }}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className={styles.inputEmail}
            defaultValue={profile.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            placeholder="Phone"
            className={styles.inputPhone}
            defaultValue={profile.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Location"
            className={styles.inputLocation}
            value={locationName}
            onChange={locChange}
            /* required */
          />
          <button type="button" className={styles.btnLocation} onClick={(handleMap)}>
            Select On Map
            <img src="./images/map icon.png" alt="mapIcon" />
          </button>
          <button type="submit" className={styles.btnSave}>Save</button>

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
                  mapboxApiAccessToken={
                    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
                  }
                  mapRef={mapRef}
                  onViewportChange={handleGeocoderViewportChange}
                  position="top-left"
                  marker={false}
                  inputValue={`${marker.latitude}, ${marker.longitude}`}
                  reverseGeocode={true}
                  onResult={(result) =>
                    setLocationName(result.result.place_name)
                  }
                />

                <div className={styles.box}>
                  <p className={styles.titleBox}>Select My location</p>
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
                    onClick={locChange}
                  >
                    Confirm location
                  </button>
                </div>
              </ReactMapGL>
            </div>
          </Modal>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
