import { message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const response = await fetch(`${apiURL}/csrf-token`, {
                method: "GET",
                credentials: "include",
            });
            const data = await response.json();
            setCsrfToken(data.csrfToken);
        };

        fetchCsrfToken();
    }, [apiURL]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiURL}/api/hesap/register`, {
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
                localStorage.setItem("token", data.token); // Token'ı localStorage'a kaydet
                message.success("Kayıt Başarılı");
                setFormData({
                    name: "",
                    surname: "",
                    email: "",
                    password: "",
                });
                navigate("/hesap"); // Profil sayfasına yönlendir
            } else {
                const errorData = await response.json();
                message.error(`Kayıt Başarısız: ${errorData.error}`);
            }
        } catch (error) {
            console.log("Kayıt Hatası", error);
            message.error("Server error occurred");
        }
    };

    return (
        <div className="account-column">
            <h2>Üye Ol</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>
                        <span>Ad <span className="required">*</span></span>
                        <input type="text" required onChange={handleInputChange} name="name" value={formData.name} />
                    </label>
                </div>
                <div>
                    <label>
                        <span>Soyad <span className="required">*</span></span>
                        <input type="text" required onChange={handleInputChange} name="surname" value={formData.surname} />
                    </label>
                </div>
                <div>
                    <label>
                        <span>E-Postanızı Giriniz <span className="required">*</span></span>
                        <input type="email" required onChange={handleInputChange} name="email" value={formData.email} />
                    </label>
                </div>
                <div>
                    <label>
                        <span>Şifrenizi Giriniz <span className="required">*</span></span>
                        <input type={passwordVisible ? "text" : "password"} required onChange={handleInputChange} name="password" value={formData.password} />
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="toggle-password">
                            <i className={passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"} id="toggle-icon"></i>
                        </button>
                    </label>
                </div>
                <p className="remember">
                    <label>
                        <input type="checkbox" required/>
                        <span>Tarafıma elektronik ileti gönderilmesini kabul ediyorum</span>
                    </label>
                    <label>
                        <input type="checkbox" required/>
                        <span>Kişisel verilerimin işlenmesine yönelik <a href="" className="account-policy">aydınlatma metnini</a> okudum ve anladım</span>
                    </label>
                </p>
                <button className="btn btn-primary btn-sm" type="submit">Üye Ol</button>
            </form>
        </div>
    );
}

export default Register;
