import { createContext, useReducer } from 'react';

export const OrderContext = createContext();

const initialState = {
  products: [],
  subtotal: 0
};

const reducer = (state, action) => {
  const { type, payload, total } = action;

  switch (type) {
    case 'ADD_CART':
      return {
        products: payload,
        subtotal: total
      };
    case 'EMPTY_CART':
      return {
        products: [],
        subtotal: 0
      };
    default:
      throw new Error();
  }
};

export const OrderContextProvider = ({ children }) => {
  const [orderedMenus, setOrderedMenus] = useReducer(reducer, initialState);

  return (
    <OrderContext.Provider value={[orderedMenus, setOrderedMenus]}>
      {children}
    </OrderContext.Provider>
  );
};
