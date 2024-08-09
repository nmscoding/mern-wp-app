import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import LoadingScreen from "../Loading/LoadingScreen";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = JSON.parse(decodeURIComponent(urlParams.get("user")));

    if (token && user) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      message.success("Giriş başarılı.");
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      window.location.href = "/";
    } else {
      message.error("Giriş başarısız. Lütfen tekrar deneyin.");
      navigate("/login");
    }
  }, [navigate]);

  return <div><LoadingScreen /></div>;
};

export default AuthSuccess;
