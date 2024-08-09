import { Link } from "react-router-dom"
import "./CampaignSingle.css"

const CampaignSingle = () => {
  return (
    <section className="mega-campaign">
    <div className="container">
      <div className="mega-campaign-wrapper">
        <h2>Tüm Cihazlarda</h2>
        <strong>%30`a Varan İndirimler</strong>
        <span></span>
        <Link to={"/tumurun"} className="btn btn-primary btn-lg">ŞİMDİ SATIN AL
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  </section>

  )
}

export default CampaignSingle