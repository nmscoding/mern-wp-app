import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { message, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ReviewForm = ({ singleProduct, setSingleProduct, user }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [fileList, setFileList] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    };

    fetchCsrfToken();
  }, [apiUrl]);

  const token = localStorage.getItem("token");

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleRatingChange = (e, newRating) => {
    e.preventDefault();
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("text", review);
    formData.append("rating", parseInt(rating));
    formData.append("user", user.id || user._id);

    fileList.forEach((file) => {
      formData.append("images", file.originFileObj);
    });

    try {
      const res = await fetch(`${apiUrl}/api/urun/${singleProduct._id}/reviews`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "CSRF-Token": csrfToken,
        },
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        message.error("Yorum Gönderilemedi");
        return;
      }

      const data = await res.json();
      setSingleProduct(data);
      setReview("");
      setRating(0);
      setFileList([]);
      message.success("Yorum Gönderildi");
    } catch (error) {
      console.log(error);
      message.error("Yorum Gönderilemedi");
    }
  };

  if (!user) {
    return <p>Yorum yapmak için giriş yapmanız gerekmektedir.</p>;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-form-rating">
        <label>
          Değerlendirmeniz
          <span className="required">*</span>
        </label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <a
              href="#"
              className={`star ${rating === value ? "active" : ""}`}
              onClick={(e) => handleRatingChange(e, value)}
              key={value}
            >
              {Array.from({ length: value }, (_, index) => (
                <i className="bi bi-star-fill" key={index}></i>
              ))}
            </a>
          ))}
        </div>
      </div>
      <div className="comment-form-comment form-comment">
        <label htmlFor="comment">
          Yorumunuz
          <span className="required">*</span>
        </label>
        <textarea
          id="comment-text"
          cols="50"
          rows="10"
          onChange={(e) => setReview(e.target.value)}
          value={review}
        ></textarea>
      </div>
      <div className="wp-sumbit-and-upload-photo">
        <div className="comment-form-images">
          <label htmlFor="comment-images"></label>
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            multiple
            beforeUpload={() => false}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Resim Yükle</Button>
          </Upload>
        </div>
        <div className="form-submit">
          <input
            type="submit"
            className="btn btn-primary btn-sm"
            value="Gönder"
          />
        </div>
      </div>
    </form>
  );
};

ReviewForm.propTypes = {
  singleProduct: PropTypes.object.isRequired,
  setSingleProduct: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default ReviewForm;
