const Sequelize = require('sequelize');
const op = Sequelize.Op;
const { transaction, order, user, product } = require("../../models");

exports.getTransactions = async (req, res) => {
  try {
    if (req.user.role != 'partner') {
      return res.send({
        status: "failed",
        message: "only partner can access"
      })
    }
    //get transactions
    const transactionsData = await transaction.findAll({
      where: {
        partner_id: req.params.id
      },
      attributes: {
        exclude: ["user_id", "updatedAt"],
      },
      include: [
        {
          model: user,
          as: 'user',
          attributes: {
            exclude: ["password", "gender", "phone", "role", "image", "createdAt", "updatedAt"],
          },
        },
        {
          model: order,
          as: "productOrdered",
          attributes: {
            exclude: ["transaction_id", "product_id", "createdAt", "updatedAt"],
          },
          include: {
            model: product,
            as: "product",
            attributes: {
              exclude: ["user_id", "createdAt", "updatedAt"],
            },
          }
        }
      ]
    })
    
    //prepare transaction data to show
    const transactions = transactionsData.map(transaction => {
      const orderDatas = transaction.productOrdered.map(orderData => {
        return {
          id: orderData.product.id,
          title: orderData.product.title,
          price: orderData.product.price,
          image: orderData.product.image,
          qty: orderData.qty
        }  
      })

      return {
        id: transaction.id,
        userOrder: transaction.user,
        status: transaction.status,
        order_date: transaction.createdAt,
        order: orderDatas
      }
    })

    res.send({
      status: "success",
      data: {
        transactions
      }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    //get transaction
    const transactionData = await transaction.findOne({
      where: {
        id
      },
      include: {
        model: user,
        as: "user",
        attributes: {
          exclude: ["image", "gender", "phone", "role", "password", "createdAt", "updatedAt"],
        },
      },
    })
    let orderedProducts = await order.findAll({
      where: {
        transaction_id: id,
      },
      include: {
        model: product,
        as: "product",
      }
    })
    orderedProducts = orderedProducts.map(orderedProduct => {
      return {
        id: orderedProduct.product.id,
        title: orderedProduct.product.title,
        price: orderedProduct.product.price,
        image: orderedProduct.product.image,
        qty: orderedProduct.qty
      }
    })

    res.send({
      status: "success",
      data: {
        transaction: {
          id: transactionData.id,
          userOrder: transactionData.user,
          status: transactionData.status,
          order: orderedProducts
        }
      }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.addtransaction = async (req, res) => {
  try {
    if (req.user.role != "user") {
      res.status(401).send({
        status: "failed",
        message: "partner can't order product",
      });
    } else {
      const products = req.body.products;

      //get product owners
      const IDProducts = products.map(IDProduct => {
        return {id: IDProduct.id}
      })
      const prod = await product.findAll({
        where: {
          [op.or]: IDProducts
        },
        attributes: ['id', 'user_id']
      })
      const productOwners = prod.map(el => {return el.user_id}).reduce(function (pVal, cVal) {
        if (pVal.indexOf(cVal) === -1) {
          pVal.push(cVal)
        }
        return pVal
      }, [])

      //insert data into table transaction
      const transactions = productOwners.map(productOwner => {
        return {
          user_id: req.user.id,
          partner_id: productOwner,
          status: "waiting approve"
        }
      })
      const newTransactions = await transaction.bulkCreate(transactions);
      
      //insert data into table order
      const orderProducts = products.map(product => {
        var IDtransaction = '';
        for (el of prod){
          if (product.id == el.id){
            for (newTransaction of newTransactions){
              if (el.user_id == newTransaction.partner_id) {IDtransaction = newTransaction.id}
            }
          }
        }
        return {
          product_id: `${product.id}`,
          transaction_id: `${IDtransaction}`,
          qty: `${product.qty}`
        }
      })
      await order.bulkCreate(orderProducts);

      //prepare data to show
      const IDtransactions = newTransactions.map(IDtransaction => {
        return {id: IDtransaction.id}
      })
      const newlyTransactions = await transaction.findAll({
        where: {
          [op.or]: IDtransactions,
        },
        include: [
          {
            model: user,
            as: "user",
            attributes: {
              exclude: ["image", "gender", "phone", "role", "password", "createdAt", "updatedAt"],
            },
          },
          {
            model: user,
            as: "partner",
            attributes: {
              exclude: ["image", "gender", "phone", "role", "password", "createdAt", "updatedAt"],
            },
          },
          {
            model: order,
            as: "productOrdered",
            attributes: {
              exclude: ["transaction_id", "product_id", "createdAt", "updatedAt"],
            },
            include: {
              model: product,
              as: "product",
              attributes: {
                exclude: ["user_id", "createdAt", "updatedAt"],
              },
            }
          }
        ],
      })
      const dataTransactions = newlyTransactions.map(newlyTransaction => {
        const orderDatas = newlyTransaction.productOrdered.map(orderData => {
          return {
            id: orderData.product.id,
            title: orderData.product.title,
            price: orderData.product.price,
            image: orderData.product.image,
            qty: orderData.qty
          }
        })
  
        return {
          id: newlyTransaction.id,
          userOrder: newlyTransaction.user,
          seller: newlyTransaction.partner,
          status: newlyTransaction.status,
          order: orderDatas
        }
      })
      

      res.send({
        status: "success",
        data: {transactions: dataTransactions}
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

exports.editTransaction = async (req, res) => {
  try{
    const { id } = req.params;

    //update table transaction
    await transaction.update(req.body, {
      where: {
        id,
      },
    });

    //prepare data for response
    const editedTransaction = await transaction.findOne({
      where: {
        id
      },
      include: {
        model: user,
        as: "user",
        attributes: {
          exclude: ["image", "gender", "phone", "role", "password", "createdAt", "updatedAt"],
        },
      },
    })
    let orderedProducts = await order.findAll({
      where: {
        transaction_id: id,
      },
      include: {
        model: product,
        as: "product",
      }
    })
    orderedProducts = orderedProducts.map(orderedProduct => {
      return {
        id: orderedProduct.product.id,
        title: orderedProduct.product.title,
        price: orderedProduct.product.price,
        image: orderedProduct.product.image,
        qty: orderedProduct.qty
      }
    })

    res.send({
      status: "success",
      data: {
        transaction: {
          id: editedTransaction.id,
          userOrder: editedTransaction.user,
          status: editedTransaction.status,
          order: orderedProducts
        }
      }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    //delete data from database product
    await transaction.destroy({ where: {id} });

    //response
    res.send({
      status: "success",
      data: { id }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}

exports.getUserTransactions = async (req, res) => {
  try {
    //get transactions of a user
    const transactionsData = await transaction.findAll({
      where: {
        user_id: req.user.id
      },
      attributes: {
            exclude: ["user_id", "updatedAt"],
      },
      include: [
        {
          model: order,
          as: "productOrdered",
          attributes: {
            exclude: ["transaction_id", "product_id", "createdAt", "updatedAt"],
          },
          include: {
            model: product,
            as: "product",
            attributes: {
              exclude: ["user_id", "createdAt", "updatedAt"],
            },
          }
        },
        {
          model: user,
          as: "partner",
          attributes: ["fullName", "location"]
        }
      ]  
    })

    //prepare data to show
    const transactions = transactionsData.map(transaction =>{
      const orderDatas = transaction.productOrdered.map(orderData => {
        return {
          id: orderData.product.id,
          title: orderData.product.title,
          price: orderData.product.price,
          image: orderData.product.image,
          qty: orderData.qty
        }
      })

      return {
        id: transaction.id,
        status: transaction.status,
        partner: transaction.partner,
        order_date: transaction.createdAt,
        order: orderDatas
      }
    })

    res.send({
      status: "success",
      data: {
        transactions
      }
    });

  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
}