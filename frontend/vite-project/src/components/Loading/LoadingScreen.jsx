
import './LoadingScreen.css'; // Stil dosyasını ekleyin

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingScreen;
