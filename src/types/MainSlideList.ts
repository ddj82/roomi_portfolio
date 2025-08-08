const getPublicUrl = (path: string) => {
    return `${process.env.PUBLIC_URL ?? ''}${path}`;
};

export const mainSlideList = [
    {
        image: getPublicUrl("/assets/test/보증금부담다운.png"),
        title: "보증금 부담 DOWN",
        description: "보증금이 비싼 한국에서도 적은 보증금으로 집을 구할 수 있어요."
    },
    {
        image: getPublicUrl("/assets/test/유연한계약기간.png"),
        title: "유연한 계약 기간",
        description: "기존 월세/전세 처럼 단위 계약이 아닌, 최소 1주 부터 거주 가능해요."
    },
    {
        image: getPublicUrl("/assets/test/자동번역지원.png"),
        title: "자동 번역 지원",
        description: "변역 기능 덕분에 외국인도 집을 쉽게 찾고, 편하게 소통 할 수 있어요."
    }
];

export const mainPopularRegion = [
    {
        image: getPublicUrl("/assets/test/서울.png"),
        title: "서울",
    },
    {
        image: getPublicUrl("/assets/test/부산.png"),
        title: "부산",
    },
    {
        image: getPublicUrl("/assets/test/제주.png"),
        title: "제주",
    },
    {
        image: getPublicUrl("/assets/test/경주.png"),
        title: "경주",
    },
    {
        image: getPublicUrl("/assets/test/강릉.png"),
        title: "강릉",
    },
    {
        image: getPublicUrl("/assets/test/대전.png"),
        title: "대전",
    },
    {
        image: getPublicUrl("/assets/test/전주.png"),
        title: "전주",
    },

];