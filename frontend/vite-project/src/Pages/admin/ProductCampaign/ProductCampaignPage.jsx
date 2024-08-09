import { Button, message, Popconfirm, Spin, Empty } from "antd";
import { useEffect, useState, useCallback } from "react";

const ProductCampaignPage = () => {
  const [productCampaign, setProductCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        credentials: 'include',
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }, [apiUrl]);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/productcampaign`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProductCampaign(data[0]); // Kampanya listesinden ilk öğeyi alın
      } else {
        message.error("Veri getirme başarısız.");
      }
    } catch (error) {
      console.error("Veri hatası:", error);
      message.error("Veri getirme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const deleteCampaign = useCallback(async () => {
    if (!productCampaign || !productCampaign._id) {
      message.error("Kampanya ID'si bulunamadı.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/api/productcampaign/${productCampaign._id}`, {
        method: "DELETE",
        headers: {
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kampanya başarıyla silindi.");
        setProductCampaign(null);
      } else {
        message.error("Silme işlemi başarısız.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      message.error("Silme işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, csrfToken, productCampaign]);

  useEffect(() => {
    fetchCsrfToken();
    fetchCampaign();
  }, [fetchCsrfToken, fetchCampaign]);

  return (
    <div className="product-campaign-page">
      {loading ? (
        <Spin tip="Yükleniyor..." />
      ) : (
        <>
          {productCampaign ? (
            <div className="product-campaign">
              <img src={`${apiUrl}${productCampaign.img}`} alt="Campaign" width={200} />
              <Popconfirm
                title="Kampanyayı Sil"
                description="Kampanyayı silmek istediğinizden emin misiniz?"
                okText="Evet"
                cancelText="Hayır"
                onConfirm={deleteCampaign}
              >
                <Button type="primary" danger>
                  Sil
                </Button>
              </Popconfirm>
            </div>
          ) : (
            <Empty description="Kampanya mevcut değil." />
          )}
        </>
      )}
    </div>
  );
};

export default ProductCampaignPage;
