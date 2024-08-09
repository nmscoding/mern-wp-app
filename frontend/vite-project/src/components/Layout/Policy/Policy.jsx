import './Policy.css'

const Policy = () => {
    return (
        <section className="policy">
            <div className="container">
                <ul className="policy-list">
                    <li className="policy-item">
                        <i className="bi bi-truck"></i>
                        <div className="policy-text">
                            <strong>Ücretsİz Teslİmat</strong>
                            <span>400₺`den Başlayan Fiyatlar</span>
                        </div>
                    </li>
                    <li className="policy-item">
                        <i className="bi bi-headset"></i>
                        <div className="policy-text">
                            <strong>7/24 Destek</strong>
                            <span>24 Saat Çevrimiçi</span>
                        </div>
                    </li>
                    <li className="policy-item">
                        <i className="bi bi-arrow-clockwise"></i>
                        <div className="policy-text">
                            <strong>14 Gün İade</strong>
                            <span>14 gün içinde iade</span>
                        </div>
                    </li>
                    <li className="policy-item">
                        <i className="bi bi-credit-card"></i>
                        <div className="policy-text">
                            <strong>Ödeme Yöntemlerİ</strong>
                            <span>Güvenli Ödeme</span>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    )
}

export default Policy