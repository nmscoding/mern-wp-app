import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CampaignPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Kampanya Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => (
        <img src={`${apiUrl}${imgSrc}`} alt="Image" width={100} />
      ),
    },
    {
      title: "Kampanya Başlığı",
      dataIndex: "title",
      key: "title",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Kampanya Açıklaması",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/campaigns/update/${record._id}`)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Kampanyayı Sil"
            description="Kampanyayı silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteCampaign(record._id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        credentials: "include",
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }, [apiUrl]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDataSource(data);
      } else {
        message.error("Veri getirme başarısız.");
      }
    } catch (error) {
      console.log("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const deleteCampaign = useCallback(
    async (campaignId) => {
      try {
        const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken,
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Kampanya başarıyla silindi.");
          setDataSource((prevCampaigns) => {
            return prevCampaigns.filter((campaign) => campaign._id !== campaignId);
          });
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchCampaigns();
  }, [fetchCsrfToken, fetchCampaigns]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default CampaignPage;
