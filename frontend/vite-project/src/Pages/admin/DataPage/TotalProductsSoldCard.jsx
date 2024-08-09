import { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPage.css';

const TotalProductSoldCard = () => {
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTotalProductsSold = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/total-products-sold`);
        setTotalProductsSold(response.data.totalProductsSold);
      } catch (error) {
        console.error('Error fetching total products sold:', error);
      }
    };

    fetchTotalProductsSold();
  }, [apiUrl]);

  return (
    <div className="scorecard">
      <p>Satılan Toplam Ürün</p>
      <strong>{totalProductsSold}</strong>
    </div>
  );
}

export default TotalProductSoldCard;
