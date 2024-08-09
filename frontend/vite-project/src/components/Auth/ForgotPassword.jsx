import { useState, useEffect } from "react";
import { message } from "antd";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
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
    }, [apiUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/hesap/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify({ email }),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Şifre sıfırlama e-postası gönderildi.");
                navigate("/baglanti-onay"); // Onay sayfasına yönlendirme
            } else {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                message.error(`Hata: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error sending forgot password request:", error);
            message.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    return (
        <div className="change-password">
            <div className="change-password-container">
                <h2>Şifre Yenileme</h2>
                <form className="wp-form change-password-email-form" onSubmit={handleSubmit}>
                    <div className="wp-display-flex wp-color-black wp-font-sm wp-flex-column wp-input-w">
                        <label className="wp-text wp-color-black wp-font-sm wp-font-w-bold wp-mgb-1">E-Posta</label>
                        <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <div className="wp-display-flex wp-mgt-1"><span className="wp-text wp-color-black wp-font-sm wp-font-w-bold"></span>
                            <span className="wp-text wp-color-soft-gray wp-font-sm wp-mgl-auto"></span>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-sm wp-password-btn">Şifremi Yenile</button>
                    <Link to="/hesap">
                        <button type="button" className="btn wp-back-btn btn-sm">Önceki Sayfaya Dön</button>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
