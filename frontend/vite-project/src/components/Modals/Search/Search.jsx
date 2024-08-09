import PropTypes from "prop-types";
import { message } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Search.css";

const Search = ({ isSearchShow, setIsSearchShow }) => {
    const [searchResults, setSearchResults] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const handleCloseModal = () => {
        setIsSearchShow(false);
        setSearchResults(null);
        setSearchTerm("");
    };

    useEffect(() => {
        const handleSearch = async () => {
            if (searchTerm.trim().length === 0) {
                setSearchResults(null);
                return;
            }

            try {
                const encodedQuery = encodeURIComponent(searchTerm.trim());
                console.log('Encoded query:', encodedQuery);
                const res = await fetch(
                    `${apiUrl}/api/urun/search?query=${encodedQuery}`
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Ürün getirme hatası:", errorText);
                    message.error("Ürün getirme hatası!");
                    return;
                }

                const data = await res.json();
                console.log('Search results:', data);
                setSearchResults(data);
            } catch (error) {
                console.log('Search error:', error);
                message.error("Arama sırasında bir hata oluştu.");
            }
        };

        const debounceTimeout = setTimeout(handleSearch, 300);

        return () => clearTimeout(debounceTimeout);
    }, [searchTerm, apiUrl]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={`modal-search ${isSearchShow ? "show" : ""}`}>
            <div className="modal-wrapper">
                <h3 className="modal-title">Ürünleri Arayın</h3>
                <p className="modal-text">
                    Aradığınız ürünleri görmek için yazmaya başlayın.
                </p>
                <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="text" 
                        placeholder="Bir ürün arayın..." 
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                    <button>
                        <i className="bi bi-search"></i>
                    </button>
                </form>
                <div className="search-results">
                    <div className="search-heading">
                        <h3>ARAMA SONUÇLARI</h3>
                    </div>
                    <div
                        className="results"
                        style={{
                            display: `${searchResults?.length === 0 || !searchResults ? "flex" : "grid"}`,
                        }}
                    >
                        {!searchResults && (
                            <b
                                className="result-item"
                                style={{
                                    justifyContent: "center",
                                    width: "100%",
                                }}
                            >
                                Ürün Ara...
                            </b>
                        )}
                        {searchResults?.length === 0 && (
                            <a
                                href="#"
                                className="result-item"
                                style={{
                                    justifyContent: "center",
                                    width: "100%",
                                }}
                            >
                                Aradığınız Ürün Bulunamadı
                            </a>
                        )}
                        {searchResults?.length > 0 &&
                            searchResults.map((resultItem) => {
                                const imageUrl = `${apiUrl}${resultItem.img[0]}`;
                                return (
                                    <Link to={`/urun/${resultItem._id}`} className="result-item" key={resultItem._id}>
                                        <img
                                            src={imageUrl}
                                            className="search-thumb"
                                            alt=""
                                        />
                                        <div className="search-info">
                                            <h4>{resultItem.name}</h4>
                                            <p className="search-sku" dangerouslySetInnerHTML={{ __html: resultItem.title }}></p>
                                            <span className="search-price">
                                                ₺{resultItem.price.newprice.toFixed(2)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
                <i className="bi bi-x-circle" id="close-search" onClick={handleCloseModal}></i>
            </div>
            <div className="modal-overlay" onClick={handleCloseModal}></div>
        </div>
    );
};

export default Search;

Search.propTypes = {
    isSearchShow: PropTypes.bool,
    setIsSearchShow: PropTypes.func,
};
