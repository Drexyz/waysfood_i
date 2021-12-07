//import models   process.env.UPLOAD_PATH + 
const { product, user } = require("../../models");

const fs = require('fs');

exports.getProducts = async (req, res) => {
  try {
    const products = await product.findAll({
      attributes: {
        exclude: ["user_id", "createdAt", "updatedAt"],
      },
      include: {
        model: user,
        as: "user",
        attributes: {
          exclude: [
            "gender",
            "password",
            "role",
            "image",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    })

    res.send({
      status: "success",
      data: {products}
    })

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.getPartnerProducts = async (req, res) => {
  try {
    let products = await product.findAll({
      where: {
        user_id: req.params.id 
      },
      attributes: {
        exclude: ["user_id", "createdAt", "updatedAt"],
      },
    })

    products = JSON.parse(JSON.stringify(products));
    products = products.map(product => {
      return {...product, image: process.env.PATH_FILE + product.image} 
    })

    res.send({
      status: "success",
      data: {products}
    })

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
} 

exports.getProduct = async (req, res) => {
  try {
    const productDetail = await product.findOne({
      where: {
        id: req.params.id
      },
      attributes: {
        exclude: ["user_id", "createdAt", "updatedAt"],
      },
      include: {
        model: user,
        as: "user",
        attributes: {
          exclude: [
            "gender",
            "password",
            "role",
            "image",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    })

    res.send({
      status: "success",
      data: {
        product: productDetail
      }
    })

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.addProduct = async (req, res) => {
  try {
    if (req.user.role != "partner") {
      res.status(401).send({
        status: "failed",
        message: "only partner can add product",
      });
    } else {
      //insert data into product
      const addedProduct = await product.create({
        ...req.body,
        image: req.file.filename,
        user_id: req.user.id,
      });

      //get newProduct data from database
      const newProduct = await product.findOne({
        where: {
          id: addedProduct.id,
        },
        attributes: {
          exclude: ["user_id", "createdAt", "updatedAt"],
        },
        include: {
          model: user,
          as: "user",
          attributes: {
            exclude: [
              "gender",
              "password",
              "role",
              "image",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      });

      //response
      res.send({
        status: "success",
        data: {
          product: newProduct,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const checkProduct = await product.findOne({ where: { id } });

  if (req.user.role != "partner") {
    res.status(401).send({
      status: "failed",
      message: "only partner can edit product",
    });

  } else if (req.user.id != checkProduct.user_id) {
    res.status(401).send({
      status: "failed",
      message: "only product owner can edit product",
    });

  } else {
    
    try {
      //delete file
      fs.unlink( 'uploads/' + checkProduct.image, (err) => { if (err) throw err; } );

      //update
      await product.update({...req.body, image: req.file.filename,}, {
        where: {
          id,
        },
      });

      //get data for response
      const editedProduct = await product.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["user_id", "createdAt", "updatedAt"],
        },
        include: {
          model: user,
          as: "user",
          attributes: {
            exclude: [
              "gender",
              "password",
              "role",
              "image",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      });

      //response
      res.send({
        status: "success",
        data: {
          product: editedProduct,
        },
      });
    } catch (error) {
      console.log(error);
      res.send({
        status: "failed",
        message: "Server Error",
      });
    }
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const checkProduct = await product.findOne({ where: { id } });

    if (req.user.id != checkProduct.user_id){
      res.status(401).send({
        status: "failed",
        message: "only product owner can delete product",
      });
    } else {
      //delete file from server
      fs.unlink( 'uploads/' + checkProduct.image, (err) => { if (err) throw err; } );
      //delete data from database product
      await product.destroy({ where: {id} });

      //response
      res.send({
        status: "success",
        data: { id }
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}