const { user, transaction, order, product } = require("../../models");

const socketIo = (io) => {
  io.on('connection', (socket) => {
    console.log(`${socket.id} connnect`)
    socket.on("load users", async () => {
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
        
        //console.log('send')
        io.sockets.emit("users", {
          status: "success",
          data: {
            users
          },
        })
      } catch (error) {
        console.log(error);
      }
    })
    socket.on("load transactions", async(user_id) => {
      try {
      //get transactions
      const transactionsData = await transaction.findAll({
        where: {
          partner_id: user_id
        },
        order: [['id', 'DESC']],
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
      
      //console.log(transactionsData)
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

      io.sockets.emit('transactions', {
        status: "success",
        user: user_id,
        data: {
          transactions
        },
      })
    } catch (error) {
      console.log(error);
    }
    })

    socket.on('disconnect', function(){
      console.log('disconnect from socket')
    });
  })
}
 
 module.exports = socketIo