import { Button, Form, Input, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";


const UpdateCampaignPage = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [setRemovedImage] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const params = useParams();
  const campaignId = params.id;

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`);

        if (!response.ok) {
          message.error("Veri getirme başarısız.");
          return;
        }

        const data = await response.json();

        if (data) {
          setExistingImage(data.img);
          form.setFieldsValue({
            title: data.title,
            desc: data.desc,
          });
        }
      } catch (error) {
        console.log("Veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl, campaignId, form]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/api/campaigns/upload`, {
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

  const onFinish = async (values) => {
    setLoading(true);

    let imgLink = existingImage;
    if (fileList.length > 0) {
      imgLink = await uploadImage(fileList[0].originFileObj);
      if (!imgLink) {
        message.error("Resim yüklenemedi.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...values,
      img: imgLink,
    };

    try {
      const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kampanya başarıyla güncellendi.");
        navigate("/admin/campaigns");
      } else {
        message.error("Kampanya güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.log("Kampanya güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleRemoveExistingImage = () => {
    setExistingImage(null);
    setRemovedImage(true);
  };

  return (
    <Spin spinning={loading}>
      <Form name="basic" layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Kampanya Başlığı"
          name="title"
          rules={[
            {
              required: true,
              message: "Lütfen kampanya başlığını girin!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Kampanya Açıklaması"
          name="desc"
          rules={[
            {
              required: true,
              message: "Lütfen kampanya açıklamasını girin!",
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Mevcut Resim">
          {existingImage && (
            <div className="existing-image-item">
              <img src={`${apiUrl}/${existingImage}`} alt="existing" className="existing-image" />
              <Button onClick={handleRemoveExistingImage}>Sil</Button>
            </div>
          )}
        </Form.Item>
        <Form.Item
          label="Yeni Resim Yükle"
          name="upload"
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
          Güncelle
        </Button>
      </Form>
    </Spin>
  );
};

export default UpdateCampaignPage;
