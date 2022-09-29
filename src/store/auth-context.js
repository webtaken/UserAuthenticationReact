import react, { useState, useEffect, useCallback } from "react";

let logoutTimer;

const AuthContext = react.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => { },
  logout: () => { }
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();
  // console.log("Curr Time: ", currentTime);
  // console.log("AdjExpiration Time: ", adjExpirationTime);
  const remainingDuration = adjExpirationTime - currentTime;
  // console.log("remainingDuration Time: ", remainingDuration);
  return remainingDuration;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExpirationTime = localStorage.getItem('expirationTime');

  const remainingTime = calculateRemainingTime(storedExpirationTime);

  // si nos queda menos de un minuto lo que hacemos es limpiar el token
  // y el tiempo de expiración
  if (remainingTime <= 6000) {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    return null;
  }
  // si todavía no expiró el token
  return {
    token: storedToken,
    duration: remainingTime
  };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;

  }
  const [token, setToken] = useState(initialToken);
  const userIsLoggedIn = !!token;

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime);
    const remainingTime = calculateRemainingTime(expirationTime);
    // la función logouthandler se llamará
    // una vez el tiempo restante se cumple
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');

    // si existe el timer de expiración lo limpiamos
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler
  };

  return <AuthContext.Provider value={contextValue}>
    {props.children}
  </AuthContext.Provider>
};


export default AuthContext;