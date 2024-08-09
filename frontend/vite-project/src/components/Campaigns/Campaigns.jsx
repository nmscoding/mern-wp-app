import { useEffect, useState } from "react";
import CampaignItem from "./CampaignItem";
import "./Campaigns.css";

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/campaigns`);
                const data = await response.json();
                setCampaigns(data);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        };

        fetchCampaigns();
    }, [apiUrl]);

    return (
        <section className="campaigns" id="campaigns">
            <div className="section-title">
            </div>
            <div className="container">          
                    <div className="campaign-wrapper">
                        {campaigns.slice(0, 2).map((campaign) => (
                            <CampaignItem
                                key={campaign._id}
                                title={campaign.title}
                                desc={campaign.desc}
                                img={`${apiUrl}${campaign.img}`}
                            />
                        ))}
                    </div>
                    <div className="campaign-wrapper">
                    {campaigns.slice(2, 4).map((campaign) => (
                            <CampaignItem
                                key={campaign._id}
                                title={campaign.title}
                                desc={campaign.desc}
                                img={`${apiUrl}${campaign.img}`}
                            />
                        ))}
                    </div>
            </div>
        </section>
    );
}

export default Campaigns;
