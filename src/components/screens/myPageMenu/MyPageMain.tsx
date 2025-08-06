import React from 'react';
import {useTranslation} from "react-i18next";

export default function MyPageMain() {
    const { t } = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <div className="flex items-center mb-4">
                <h2 className="font_title">{t("마이 루미")}</h2>
            </div>
        </div>
    );
};
