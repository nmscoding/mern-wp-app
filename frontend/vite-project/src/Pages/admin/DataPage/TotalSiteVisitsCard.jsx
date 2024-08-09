import { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPage.css'; // Stil dosyasını unutmayın

const TotalSiteVisitsCard = () => {
  const [totalSiteVisits, setTotalSiteVisits] = useState(0);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTotalSiteVisits = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/site-visits/total-site-visits`);
        setTotalSiteVisits(response.data.totalSiteVisits);
      } catch (error) {
        console.error('Error fetching total site visits:', error);
      }
    };

    fetchTotalSiteVisits();
  }, [apiUrl]);

  return (
    <div className="scorecard">
      <p>Toplam Site Ziyareti (Son 30 Gün)</p>
      <strong>{totalSiteVisits}</strong>
    </div>
  );
}

export default TotalSiteVisitsCard;
