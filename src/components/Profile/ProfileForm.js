import { useContext, useRef, useState } from "react";
import classes from "./ProfileForm.module.css";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router-dom";
const ProfileForm = () => {
  const newPasswordInputRef = useRef();
  const ctx = useContext(AuthContext);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();
  const submitHandler = (e) => {
    e.preventDefault();
    const enteredNewPassword = newPasswordInputRef.current.value;
    if (enteredNewPassword.length < 6) {
      setError("Password must be minimum 6 chars");
      return;
    }
    fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyDcCp42oxGhLdUpUDyDjwLbS7fBFJO2wm8",
      {
        method: "POST",
        body: JSON.stringify({
          idToken: ctx.token,
          password: enteredNewPassword,
          returnSecureToken: false,
        }),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((resp) => {
        console.log(resp);
        if (!resp.ok) {
          throw new Error("Something went wrong");
        }
        setSuccess(true);
        setTimeout(() => {
          history.replace("/");
        }, 200);
      })
      .catch((err) => {
        console.log("there is error");
        setError(err.message);
      });
  };
  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input type="password" id="new-password" ref={newPasswordInputRef} />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
      {success && !error && (
        <p style={{ color: "yellowgreen" }}>Successfully changed password</p>
      )}
      {error && !success && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
};

export default ProfileForm;
