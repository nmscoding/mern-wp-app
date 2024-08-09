import { useState, useEffect } from "react";
import { Button, Form, Spin, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const CreateProductCampaignPage = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
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
  }, [apiUrl]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/api/productcampaign/upload`, {
        method: 'POST',
        headers: {
          "CSRF-Token": csrfToken,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        message.error('Resim yükleme başarısız.');
        return null;
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      return null;
    }
  };

  const deleteExistingCampaign = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/productcampaign`, {
        method: 'DELETE',
        headers: {
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        message.success("Mevcut kampanya başarıyla silindi.");
      } else {
        message.error("Mevcut kampanya silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error('Mevcut kampanya silme hatası:', error);
    }
  };

  const onFinish = async () => {
    setLoading(true);

    if (fileList.length === 0) {
      message.error("Lütfen bir kampanya görseli yükleyin.");
      setLoading(false);
      return;
    }

    await deleteExistingCampaign();
    const imgLink = await uploadImage(fileList[0].originFileObj);

    if (!imgLink) {
      message.error("Resim yüklenemedi.");
      setLoading(false);
      return;
    }

    const payload = {
      img: imgLink,
    };

    try {
      const response = await fetch(`${apiUrl}/api/productcampaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kampanya başarıyla oluşturuldu.");
        form.resetFields();
        setFileList([]);
        navigate("/admin/productcampaign");
      } else {
        const errorData = await response.json();
        message.error(`Kampanya oluşturulurken bir hata oluştu: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Kampanya oluşturma hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Spin spinning={loading}>
      <Form name="basic" layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Kampanya Görseli Yükle"
          name="upload"
          rules={[
            {
              required: true,
              message: "Lütfen bir kampanya görseli yükleyin."
            },
          ]}
        >
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Resim Yükle</Button>
          </Upload>
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Oluştur
        </Button>
      </Form>
    </Spin>
  );
};

export default CreateProductCampaignPage;
