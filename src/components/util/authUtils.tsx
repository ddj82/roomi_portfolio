import {channelLogin, login} from "../../api/api";

export async function handleLogin(
    email: string,
    password: string,
    setAuthToken: (token: string | null) => void,
    setIsHost: (isHost: boolean) => void,
    connect: (token: string) => void) {
    try {
        // 1. 로그인 요청
        await login(email, password, setAuthToken);
        await UserSetting(setIsHost, connect);
    } catch (error) {
        console.error("로그인 처리 중 오류:", error);
    }
}

export async function SocialLogin(
    socialChannelUid: string,
    socialChannel: string,
    setAuthToken: (token: string | null) => void,
    setIsHost: (isHost: boolean) => void,
    connect: (token: string) => void) {
    try {
        // 1. 로그인 요청
        await channelLogin(socialChannelUid, socialChannel, setAuthToken);
        await UserSetting(setIsHost, connect);
    } catch (error) {
        console.error("소셜 로그인 처리 중 오류:", error);
    }
}

export async function UserSetting(
    setIsHost: (isHost: boolean) => void,
    connect: (token: string) => void) {
    // 2. isHost 처리
    const hostStatus = localStorage.getItem("userIsHost") === "true";
    // console.log("hostStatus값 :", hostStatus);
    setIsHost(hostStatus);

    // 3. WebSocket 연결
    let token = localStorage.getItem("authToken");
    if (token) {
        token = token.replace(/^Bearer\s/, "");
        connect(token);
        console.log('로그인 성공! AuthToken isHost 업데이트 완료');
    } else {
        console.error("❌ Auth Token이 없습니다.");
    }
}
