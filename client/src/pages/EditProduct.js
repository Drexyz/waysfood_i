import Navbar from '../components/Navbar';
import styles from './EditProduct.module.css';
import React, {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

//API config
import { API } from "../config/api";

function EditProduct(){
    let navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [product, setProduct] = useState({});
    const {productId} = useParams();
    const [form, setForm] = useState({
      title: '',
      price: '',
      image: '',
    });

    const getProduct = async () => {
      try{
        const response = await API.get(`/product/${productId}`);
        //console.log(response.data.data.product);
        setProduct(response.data.data.product);
        setPreview(response.data.data.product.image);
        setForm({
          title: response.data.data.product.title,
          price: response.data.data.product.price,
          image: response.data.data.product.image.slice(30,),
        });
      } catch (error) {
        console.log(error);
      }
    }

    useEffect(() => {
      getProduct();
    }, []);

    // Handle change data on form
    const handleChange = (e) => {
      setForm({
        ...form,
        [e.target.name]:
          e.target.type === 'file' ? e.target.files : e.target.value,
      });

      // Create image url for preview
      if (e.target.type === 'file') {
        let url = URL.createObjectURL(e.target.files[0]);
        setPreview(url);
      }
    };

    const handleSubmit = async (e) => {
      try {
        e.preventDefault();
    
        // Create Configuration Content-type
        const config = {
          headers: {
            'Content-type': 'multipart/form-data',
          },
        };
    
        //store data with FormData as object
        const formData = new FormData();
        if (typeof(form.image) === 'object') {
          formData.set('image', form.image[0], form.image[0].name);
        } else {
          formData.set('image', form.image);
        }
        formData.set('title', form.title);
        formData.set('price', form.price);
    
        //Insert product data
        const response = await API.patch(`/product/${productId}`, formData, config);
    
        console.log(response);
    
        navigate('/myproduct');
      } catch (error) {
        console.log(error);
      }
    };

    return(
        <div>
            <Navbar />
            <div className={styles.AddProduct}>
                <h4>Edit Product</h4>
                <form className={styles.editProfilForm} onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title" className={styles.inputName} 
                      onChange={handleChange} name='title' defaultValue={product.title}/>
                    <label htmlFor="file" className={styles.inputFile}>Attach Image<img src="./images/attachFile.png" alt="" /></label>
                        <input type="file" hidden id="file" name="image"
                          onChange={handleChange} aria-label="File browser example" />
                        <div id="preview" className={styles.preview}>
                          <img src={preview} style={{
                            maxWidth: "150px",
                            maxHeight: "150px",
                            objectFit: "content",
                          }}/>
                        </div>
                    <input type="number" placeholder="Price" name='price' defaultValue={product.price}
                      className={styles.inputPrice} onChange={handleChange}/>
                    <button className={styles.btnSave}>Save</button>
                </form>
            </div>
        </div>
    )
};

export default EditProduct;