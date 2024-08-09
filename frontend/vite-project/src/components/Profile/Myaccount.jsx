import { useState, useEffect } from "react";
import "./Myaccount.css";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const Myaccount = () => {
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      message.error("Lütfen giriş yapın.");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);

        const userResponse = await fetch(`${apiUrl}/api/hesap/profile`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!userResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const userData = await userResponse.json();
        setUserData({
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          phone: userData.phone || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Kullanıcı bilgilerini alırken bir hata oluştu.");
      }
    };

    fetchUserData();
  }, [apiUrl, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/hesap/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      if (response.ok) {
        message.success("Kullanıcı bilgileri güncellendi.");
      } else {
        message.error("Bilgileri güncellerken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      message.error("Bilgileri güncellerken bir hata oluştu.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/hesap/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(passwordData),
        credentials: "include",
      });
      if (response.ok) {
        message.success("Şifre güncellendi.");
      } else {
        message.error("Şifre güncellerken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Şifre güncellerken bir hata oluştu.");
    }
  };

  return (
    <div className="profile-info">
      <h2>Kullanıcı Bilgilerim</h2>
      <div className="user-form">
        <div className="form-section">
          <h1>Üyelik Bilgileri</h1>
          <form onSubmit={handleUserUpdate}>
            <div className="name-surname-wrapper">
              <label>
                <span>Ad</span>
                <input
                  type="text"
                  name="name"
                  value={userData.name || ""}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                <span>Soyad</span>
                <input
                  type="text"
                  name="surname"
                  value={userData.surname || ""}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={userData.email || ""}
                onChange={handleInputChange}
                disabled
              />
            </label>
            <label>
              <span>Cep Telefonu</span>
              <input
                type="tel"
                name="phone"
                value={userData.phone || ""}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit" className="btn btn-primary acc-btn">Güncelle</button>
          </form>
        </div>
        <div className="form-section">
          <h1>Şifre Güncelleme</h1>
          <form onSubmit={handlePasswordUpdate}>
            <label>
              <span>Şuanki Şifre</span>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <label>
              <span>Yeni Şifre</span>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <button type="submit" className="btn btn-primary acc-btn">Güncelle</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Myaccount;
