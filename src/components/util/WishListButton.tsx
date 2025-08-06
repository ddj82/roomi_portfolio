import React, {useEffect, useState} from 'react';
import {FaHeart, FaRegHeart} from 'react-icons/fa'; // react-icons/fa에서 FontAwesome 아이콘 가져오기
import 'src/css/WishlistButton.css';
import {addFavoriteRoom, deleteFavoriteRoom} from "../../api/api";
import AuthModal from "../modals/AuthModal";
import CommonAlert from "./CommonAlert";

interface WishlistButtonProps {
    onToggle?: (isLiked: boolean) => void,
    roomId?: number,
    isFavorite?: boolean
}

const WishListButton: React.FC<WishlistButtonProps> = ({onToggle, roomId, isFavorite}) => {
    const [isLiked, setIsLiked] = useState(isFavorite);

    // 공용 얼럿창 상태
    const [alertOpen, setAlertOpen] = useState(false);

    // 찜 상태를 토글하는 함수
    const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 전파 방지
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            setAlertOpen(true);
            return;
        }
        const newState = !isLiked;
        setIsLiked(newState);
        try {
            if (newState) {
                console.log('찜', newState);
                addFavorite();
            } else {
                console.log('ㄴ찜', newState);
                deleteFavorite();
            }
        } catch (error) {
            console.error('찜 api 실패:', error);
        }
    };
    const addFavorite = async () => {
        if (roomId != null) {
            const response = await addFavoriteRoom(roomId);
            const responseJson = await response.json();
            const roomData = responseJson.data;
            console.log('데이터 :', roomData);
        }
    };
    const deleteFavorite = async () => {
        if (roomId != null) {
            const response = await deleteFavoriteRoom(roomId);
            const responseJson = await response.json();
            const roomData = responseJson.data;
            console.log('데이터 :', roomData);
        }
    };

    return (
        <>
            <div>
                <button
                    type="button"
                    className="wishListBtn z-50 p-2"
                    onClick={toggleWishlist}
                >
                    {isLiked ? (
                        <FaHeart size={21} color="#FF8282"/> // 찜 상태일 때
                    ) : (
                        <FaRegHeart size={21} color="#FFFFFF"/> // 찜 안된 상태일 때
                    )}
                </button>
            </div>

            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    content="로그인 후 이용 가능합니다."
                />
            )}
        </>
    );
};

export default WishListButton;
