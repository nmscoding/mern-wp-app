import { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPage.css'; // Stil dosyasını unutmayın

const TotalWagesEarned = () => {
    const [totalWagesEarned, setTotalWagesEarned] = useState(0);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchTotalWagesEarned = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/orders/total-wages-earned`);
                setTotalWagesEarned(response.data.totalWagesEarned);
            } catch (error) {
                console.error('Error fetching total wages earned:', error);
            }
        };

        fetchTotalWagesEarned();
    }, [apiUrl]);

    return (
        <div className="scorecard">
            <p>Toplam Satış Tutarı</p>
            <strong>₺{totalWagesEarned}</strong>
        </div>
    );
}

export default TotalWagesEarned;
