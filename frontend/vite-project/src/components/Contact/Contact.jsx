import { useState, useEffect } from "react";
import { message as antdMessage } from "antd";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken
        },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      if (response.ok) {
        antdMessage.success("Mesajınız başarıyla gönderildi.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        antdMessage.error("Mesaj gönderilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      antdMessage.error("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  return (
    <section className="contact">
      <div className="contact-top">
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3124.128359283472!2d27.17955945140311!3d38.46159784141544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b97dd8b3a40ce5%3A0x78f9f044774aa26d!2sWater%20Planet%20Su%20Ar%C4%B1tma%20Teknolojileri!5e0!3m2!1str!2str!4v1717189693382!5m2!1str!2str"
            width="100%" height="500" style={{ border: "0" }} allowFullScreen="" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
      <div className="contact-bottom">
        <div className="container">
          <div className="contact-titles">
            <h4>Bizimle İletişime Geç</h4>
            <h2>İLETİŞİM</h2>
            <p>Kısa sürede dönüş sağlarız.</p>
          </div>
          <div className="contact-elements">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="">
                <label htmlFor="name">
                  Adınız
                  <span> *</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="">
                <label htmlFor="email">
                  Mail Adresiniz
                  <span> *</span>
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="">
                <label htmlFor="subject">
                  Konu
                  <span> *</span>
                </label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="">
                <label htmlFor="message">
                  Mesajınız
                  <span> *</span>
                </label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required></textarea>
              </div>
              <button className="btn btn-primary btn-sm form-button" type="submit">Mesajı Gönder</button>
            </form>
            <div className="contact-info">
              <div className="contact-info-texts">
                <strong>Water Planet</strong>
                <p className="contact-street">Adalet Mahallesi 1593/5 Sokak No 34F Bayraklı/İZMİR</p>
                <a href="tel: 123 456 78 90">Telefon: 505 091 19 12</a>
                <a href="Email: contact@example.com">Email: info@waterplanet.info</a>
              </div>
              <div className="contact-info-texts">
                <strong>Çalışma Saatleri</strong>
                <p className="contact-date">Pazartesi*Cumartesi 09.00 - 20.00</p>
                <p>Pazar Kapalı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
