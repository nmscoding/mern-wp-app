import { useState, useEffect, useCallback } from "react";
import "./Slider.css";
import SliderItem from "./SliderItem";
import axios from "axios";

const Sliders = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/sliders`, { withCredentials: true });
                const slidesData = response.data.map(slide => ({
                    ...slide,
                    productId: slide.productId ? slide.productId._id.toString() : "" // Ensure productId is a string
                }));
                setSlides(slidesData);
            } catch (error) {
                console.error("Error fetching slides:", error);
            }
        };

        fetchSlides();
    }, [apiUrl]);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 7000);

        return () => {
            clearInterval(interval);
        };
    }, [nextSlide]);

    return (
        <section className="slider">
            <div className="slider-elements" id="slider-elements">
                {slides.map((slide, index) => (
                    currentSlide === index && (
                        <SliderItem
                            key={slide._id}
                            title={slide.title}
                            subtitle={slide.subtitle}
                            imageSrc={`${apiUrl}/${slide.img}`}
                            productId={slide.productId}
                        />
                    )
                ))}
                <div className="slider-buttons">
                    <button onClick={prevSlide}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <button onClick={nextSlide}>
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`slider-dot ${currentSlide === index ? "active" : ""}`}
                            onClick={() => setCurrentSlide(index)}
                        >
                            <span></span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Sliders;
