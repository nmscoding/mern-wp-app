import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
    FacebookShareButton,
    WhatsappShareButton,
    FacebookIcon,
    WhatsappIcon,
} from 'react-share';
import './ShareModal.css';
import XIcon from './x-icon.png'; 

const ShareModal = ({ isOpen, onRequestClose, shareUrl }) => {
    const handleXShare = () => {
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterShareUrl, '_blank');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="react-modal-content"
            overlayClassName="react-modal-overlay"
            contentLabel="Share Modal"
            ariaHideApp={false}
        >
            <h2 className='share-modal-title'>Paylaş</h2>
            <div className="share-buttons">
                <FacebookShareButton url={shareUrl}>
                    <FacebookIcon size={64} round />
                </FacebookShareButton>
                <WhatsappShareButton url={shareUrl}>
                    <WhatsappIcon size={64} round />
                </WhatsappShareButton>
                <button onClick={handleXShare}>
                    <img src={XIcon} alt="X" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                </button>
            </div>
            <div className="copy-link">
                <input type="text" value={shareUrl} readOnly />
                <button className='share-modal-btn btn-sm' onClick={() => navigator.clipboard.writeText(shareUrl)}>Linki Kopyala</button>
            </div>
            <button className='share-modal-close-button' onClick={onRequestClose}><i className='bi bi-x'></i></button>
        </Modal>
    );
};

ShareModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    shareUrl: PropTypes.string.isRequired,
};

export default ShareModal;
