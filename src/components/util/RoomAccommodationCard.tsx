import React, {memo, useCallback} from "react";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import WishListButton from "./WishListButton";
import ImgCarousel from "./ImgCarousel";

const RoomAccommodationCard = memo(
    ({ item, onClick }: { item: RoomData; onClick: () => void }) => {
        const formatPrice = useCallback((price: number | null) => {
            if (!price) return '가격 정보 없음';
            return `${item.symbol} ${price.toLocaleString()}`;
        }, [item]);
        const {t} = useTranslation();

        return (
            <div className="bg-transparent border-none shadow-none cursor-pointer" onClick={onClick}>
                <div className="relative mb-2">
                    <WishListButton roomId={item.id} isFavorite={item.is_favorite}/>
                    {item.detail_urls && item.detail_urls.length > 0 ? (
                        <ImgCarousel
                            images={item.detail_urls}
                            customClass="w-full aspect-square object-cover rounded-xl"
                        />
                    ) : (
                        <img
                            src="/default-image.jpg"
                            alt="thumbnail"
                            className="w-full aspect-square object-cover rounded-xl"
                        />
                    )}
                </div>
                <div className="p-0">
                    <div className="mb-1">
                        <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-2 mb-1">{item.title || '제목 없음'}</h3>
                        {typeof item.month_price === 'number' && item.month_price > 0 && (
                            <p className="text-xs md:text-sm font-light text-gray-500 m-0">{formatPrice(item.month_price)} / {t('월')}</p>
                        )}
                        {typeof item.week_price === 'number' && item.week_price > 0 && (
                            <p className="text-xs md:text-sm font-light text-gray-500 m-0">{formatPrice(item.week_price)} / {t('주')}</p>
                        )}
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 m-0 line-clamp-1">{item.address || '주소 정보 없음'}</p>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);

export default RoomAccommodationCard;