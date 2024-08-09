import { Button, Form, Input, InputNumber, DatePicker, Select, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from 'moment';

const UpdateCouponPage = () => {
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [form] = Form.useForm();
  const params = useParams();
  const couponId = params.id;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  const onFinish = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token'); // Get JWT token from localStorage

    try {
      const response = await fetch(`${apiUrl}/api/coupons/${couponId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken, // Include CSRF token in headers
          "Authorization": `Bearer ${token}` // Include JWT token in headers
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kupon başarıyla güncellendi.");
      } else {
        message.error("Kupon güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.log("Kupon güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSingleCoupon = async () => {
      setLoading(true);
      const token = localStorage.getItem('token'); // Get JWT token from localStorage

      try {
        const response = await fetch(`${apiUrl}/api/coupons/${couponId}`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}` // Include JWT token in headers
          },
        });

        if (!response.ok) {
          throw new Error("Verileri getirme hatası");
        }

        const data = await response.json();

        if (data) {
          form.setFieldsValue({
            code: data.code,
            discountValue: data.discountValue,
            discountType: data.discountType,
            minimumSpend: data.minimumSpend, // Add minimumSpend to form values
            expiryDate: data.expiryDate ? moment(data.expiryDate) : null,
          });
        }
      } catch (error) {
        console.log("Veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleCoupon();
  }, [apiUrl, couponId, form]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item
          label="Kupon İsmi"
          name="code"
          rules={[
            {
              required: true,
              message: "Lütfen Kupon adını girin!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Kupon İndirim Değeri"
          name="discountValue"
          rules={[
            {
              required: true,
              message: "Lütfen Kupon indirim değeri girin!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="İndirim Türü"
          name="discountType"
          rules={[
            {
              required: true,
              message: "Lütfen İndirim türünü seçin!",
            },
          ]}
        >
          <Select>
            <Select.Option value="percent">Yüzde</Select.Option>
            <Select.Option value="amount">Birim</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Minimum Harcama Tutarı"
          name="minimumSpend"
          rules={[
            {
              required: true,
              message: "Lütfen minimum harcama tutarını girin!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="Geçerlilik Tarihi"
          name="expiryDate"
          rules={[
            {
              required: true,
              message: "Lütfen Geçerlilik tarihini seçin!",
            },
          ]}
        >
          <DatePicker showTime />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Güncelle
        </Button>
      </Form>
    </Spin>
  );
};

export default UpdateCouponPage;
