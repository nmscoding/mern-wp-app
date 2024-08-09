import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      navigate("/");
    }

    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        message.error("Bir hata oluştu. Lütfen sayfayı yenileyin.");
      }
    };

    fetchCsrfToken();
  }, [user, navigate, apiUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/hesap/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        message.success("Giriş başarılı.");
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          navigate("/");
        }
      } else {
        const errorData = await response.json();
        message.error(`Giriş başarısız: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      message.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="account-column">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            <span>E-Postanızı Giriniz <span className="required">*</span></span>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label>
            <span>Şifrenizi Giriniz <span className="required">*</span></span>
            <input
              type={passwordVisible ? "text" : "password"}
              required
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button type="button" className="toggle-password" onClick={() => setPasswordVisible(!passwordVisible)}>
              <i className={passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"} id="toggle-icon"></i>
            </button>
          </label>
        </div>
        <p className="remember">
          <label>
            <input type="checkbox" />
            <span>Beni Hatırla</span>
          </label>
          <button className="btn btn-primary btn-sm" type="submit">Giriş Yap</button>
        </p>
        <Link to="/sifremi-unuttum" className="form-link">Şifremi Unuttum.</Link>
      </form>
      <div className="social-account-login-buttons">
        <div className="q-layout social-login-button flex flex-1" onClick={() => window.location.href = `${apiUrl}/auth/google`}>
          <div className="social-login-icon" style={{ backgroundColor: 'rgb(241, 66, 54)' }}>
            <i className="bi bi-google"></i>
          </div>
          <div className="flex flex-column">
            <div>
              <div>Google</div>
              <small>ile giriş yap</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
