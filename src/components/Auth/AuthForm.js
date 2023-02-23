import { useContext, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const ctx = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
    setError(null);
    emailInputRef.current.value = "";
    passwordInputRef.current.value = "";
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setError(null);
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    //validation...
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(enteredEmail)) {
      setEmailIsValid(true);
    } else {
      setEmailIsValid(false);
      return;
    }
    if (enteredPassword.trim().length < 6) {
      setPasswordIsValid(false);
      return;
    } else setPasswordIsValid(true);
    setIsLoading(true);
    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDcCp42oxGhLdUpUDyDjwLbS7fBFJO2wm8";
    } else {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDcCp42oxGhLdUpUDyDjwLbS7fBFJO2wm8";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => {
        setIsLoading(false);
        if (resp.ok) {
          return resp.json();
        } else {
          return resp.json().then((data) => {
            // show error modal
            console.log(data);
            let errorMessage = "Authentiaction failed.";
            if (data && data.error && data.error.message) {
              if (data.error.message === "INVALID_PASSWORD") {
                errorMessage = "Invalid password";
              } else if ((data.error.message = "EMAIL_NOT_FOUND")) {
                errorMessage = "No user with this email";
              } else if ((data.error.message = "EMAIL_EXISTS")) {
                errorMessage = "Email already exists";
              } else {
                errorMessage = data.error.message;
              }
            }
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        console.log(data);
        const expirationTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        ctx.login(data.idToken, expirationTime.toISOString());
        history.replace("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
          {emailIsValid ? (
            ""
          ) : (
            <p style={{ color: "crimson" }}>Please enter valid email</p>
          )}
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
          {passwordIsValid ? (
            ""
          ) : (
            <p style={{ color: "crimson" }}>
              Please enter password with atleast 6 chars{" "}
            </p>
          )}
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && (
            <p style={{ color: "greenyellow" }}>Sending request...</p>
          )}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : ""}
      </form>
    </section>
  );
};

export default AuthForm;
