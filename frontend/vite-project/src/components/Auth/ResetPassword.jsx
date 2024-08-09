import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

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
            const response = await fetch(`${apiUrl}/api/hesap/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify({ token, newPassword }),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Şifreniz başarıyla sıfırlandı.");
                navigate("/hesap");
            } else {
                const errorData = await response.json();
                message.error(`Hata: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            message.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    return (
        <div className="change-password">
            <div className="change-password-container">
                <h2>Yeni Şifre Belirleyin</h2>
                <form className="wp-form change-password-email-form" onSubmit={handleSubmit}>
                    <div className="wp-display-flex wp-color-black wp-font-sm wp-flex-column wp-input-w">
                        <label className="wp-text wp-color-black wp-font-sm wp-font-w-bold wp-mgb-1">Yeni Şifrenizi Giriniz</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <div className="wp-display-flex wp-mgt-1"><span className="wp-text wp-color-black wp-font-sm wp-font-w-bold"></span>
                            <span className="wp-text wp-color-soft-gray wp-font-sm wp-mgl-auto"></span>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-sm wp-password-btn">Şifremi Güncelle</button>
                    <Link to="/hesap">
                        <button type="button" className="btn wp-back-btn btn-sm">Giriş Sayfasına Dön</button>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
