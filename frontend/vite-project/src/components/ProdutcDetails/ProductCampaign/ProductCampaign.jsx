import { useEffect, useState } from 'react';
import './ProductCampaign.css';

const ProductCampaign = () => {
    const [productCampaign, setProductCampaign] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/productcampaign`);
                const data = await response.json();
                if (data.length > 0) {
                    setProductCampaign(data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign:", error);
            }
        };

        fetchCampaign();
    }, [apiUrl]);

    return (
        <div className="sales-photo">
            {productCampaign && (
                <img src={`${apiUrl}${productCampaign.img}`} alt="Campaign" />
            )}
        </div>
    );
}

export default ProductCampaign;
