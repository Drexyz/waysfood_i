//import models
const { user } = require("../../models");

// import package
const joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.addUsers = async (req, res) => {
  //schema data register
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
    fullName: joi.string().min(3).required(),
    gender: joi.string(),
    phone: joi.string().min(6).required(),
    role: joi.string().required(),
  });

  //validate data register
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(401).send({
      error: error.details[0].message,
    });
  }

  try {
    //check existing email
    const checker = await user.findOne({
      where: {
        email: req.body.email
      }
    });
    
    if (checker) {
      return res.status(409).send({
        status: "failed",
        message: "email already exist"
      })
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //input to table user
    const newUser = await user.create({
      ...req.body,
      password: hashedPassword,
    });

    //create token
    const data = {
      id: newUser.id,
      status: newUser.role,
      location: newUser.location,
    };
    const token = jwt.sign(data, process.env.SECRET_KEY);

    //success response
    res.send({
      status: "success",
      data: {
        user: {
          fullName: newUser.fullName,
          token,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.getUser = async (req, res) => {
  //schema data login
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });

  //validate data login
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(401).send({
      status: "failed",
      message: error.details[0].message,
    });
  }

  try {
    const { email, password } = req.body;

    //get user with the same email & password
    const userlogin = await user.findOne({
      where: {
        email,
      },
    });

    //compare data password with hashed password
    const isValid = await bcrypt.compare(password, userlogin.password);

    //response user not found & wrong pass
    if (!userlogin || !isValid) {
      return res.status(400).send({
        status: "failed",
        message: "User not found or Password Not Match",
      });
    } else {
      //create token
      const data = {
        id: userlogin.id,
        role: userlogin.role,
        location: userlogin.location,
      };
      const token = jwt.sign(data, process.env.SECRET_KEY);

      //response login
      res.send({
        status: "success",
        data: {
          user: {
            id: userlogin.id,
            fullName: userlogin.fullName,
            email: userlogin.email,
            location: userlogin.location,
            role: userlogin.role,
            image: process.env.PATH_FILE + userlogin.image,
            token,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    //get all data from table users
    let users = await user.findAll({
      attributes: {
        exclude: ["password", "gender", "createdAt", "updatedAt"],
      },
    })

    users = JSON.parse(JSON.stringify(users));

    users = users.map((user) => {
      return { ...user, image: process.env.PATH_FILE + user.image };
    });

    res.send({
      status: "success",
      data: {
        users
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

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    //delete from database
    await user.destroy({
      where: {
        id,
      },
    });

    //success response
    res.send({
      status: "success",
      data: {
        id
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

exports.checkUser = async (req, res) => {
  try {
    let detailUser = await user.findOne({
      where: {
        id: req.user.id
      },
      attributes:  ["id", "fullName", "email", "role", "image"]
    });

    if (!detailUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    detailUser.image =  process.env.PATH_FILE + detailUser.image;

    res.send({
      status: "success",
      data: {user: detailUser}
    })
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.editUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file){
      await user.update({...req.body}, {
        where: {
          id,
        },
      });
    } else {
      await user.update({...req.body, image: req.file.filename,}, {
        where: {
          id,
        },
      });
    }

    //response
    res.send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.user = async (req, res) => {
  try {
    //get user name from id (for restaurant name)
    const userDetail = await user.findOne({
      where: {
        id: req.params.id,
      },
      attributes:  ["id", "fullName"]
    });

    res.send({
      status: "success",
      data: userDetail,
    });
  } catch (error) {

  }
}

exports.profile = async (req, res) => {
  try {
    let detailUser = await user.findOne({
      where: {
        id: req.user.id
      },
      attributes:  ["id", "fullName", "location", "email", "phone", "image", "role"]
    });

    if (!detailUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    detailUser.image =  process.env.PATH_FILE + detailUser.image;

    res.send({
      status: "success",
      data: {user: detailUser}
    })
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
}
//exports.updateUser = async (req, res) => {}