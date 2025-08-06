import PortOne from "@portone/browser-sdk/v2"
import React, {useEffect, useState} from "react"
import {confirmPayment} from "../../api/api";
import dayjs from "dayjs";
import Modal from "react-modal";

export function CheckoutPage({ paymentData, modalOpen, modalClose }) {
    const [paymentStatus, setPaymentStatus] = useState({
        status: "IDLE",
    });

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [modalOpen]);

    if (paymentData == null) {
        return (
            <dialog open>
                <article aria-busy>결제 정보를 불러오는 중입니다.</article>
            </dialog>
        )
    }

    const generateRandom7Digits = () => {
        // 0부터 9999999까지의 숫자 중 하나를 랜덤으로 뽑고, 앞에 0이 있으면 채워서 길이를 7자리로 맞춤
        const randomNumber = Math.floor(Math.random() * 10_000_000); // 0 이상 10^7 미만
        return String(randomNumber).padStart(7, '0');
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setPaymentStatus({ status: "PENDING" });

        const today = dayjs().format('YYYYMMDD');
        const paymentId = today + generateRandom7Digits();
        console.log('paymentId만듬',paymentId);

        const payment = await PortOne.requestPayment({
            storeId: "store-7bb98274-0fb5-4b2e-8d60-d3bff2f3ca85",
            channelKey: "channel-key-14a7fa72-0d06-4bb5-9502-f721b189eb86",
            // channelKey: "channel-key-7f9f2376-d742-40f7-9f6f-9ea74579cbe1",
            paymentId: paymentId,
            orderName: paymentData.bookRoom.title,
            // totalAmount: Math.round(paymentData.price),
            totalAmount: 1000,
            currency: "KRW",
            payMethod: "CARD",
            customer: {
                customerId: paymentData.formDataState.phone, // 변경해야함
                fullName: paymentData.formDataState.name,
                phoneNumber: paymentData.formDataState.phone,
                email: paymentData.formDataState.email,
                address: {
                    addressLine1: paymentData.bookRoom.address,
                    addressLine2: "", // 상세주소 없긴해
                    country: "KR"
                }
            },
            redirectUrl: window.location.origin + "/success.html",
        })
        if (payment.code !== undefined) {
            setPaymentStatus({
                status: "FAILED",
                message: payment.message,
            })
            return
        }

        const completeResponse = await confirmPayment(payment.paymentId, paymentData.bookReservation.id.toString());
        const paymentComplete = await completeResponse.json();
        console.log('completeResponse',completeResponse);
        console.log('paymentComplete',paymentComplete);

        if (paymentComplete.success) {
            setPaymentStatus({
                status: "PAID",
            })
        } else {
            setPaymentStatus({
                status: "FAILED",
                message: paymentComplete.error,
            })
        }
    }

    const isWaitingPayment = paymentStatus.status !== "IDLE";

    const handleClose = () =>
        setPaymentStatus({
            status: "IDLE",
        });

    return (
        <Modal
            isOpen={modalOpen}
            onRequestClose={modalClose}
            shouldCloseOnOverlayClick={false}   // 바깥영역 클릭 막기
            shouldCloseOnEsc={false}            // Esc 닫기 막기 (선택)
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 10000,           // 헤더(2000)보다, 리모컨(100)보다 훨씬 크게
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                content: {
                    position: 'relative',    // overlay가 flex container가 되므로 굳이 fixed 안 해도 중앙 정렬됩니다.
                    inset: 'auto',           // 기본 inset(0) 제거
                    border: 'none',
                    background: 'transparent',
                    padding: '0',
                    overflow: 'visible',
                    // 필요하다면 content에도 zIndex 지정 가능
                    zIndex: 10001,
                },
            }}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '1rem',
                    width: '90%',
                    maxWidth: '500px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    position: 'relative',
                    // 만약 내부 다른 요소가 겹칠 일이 있다면 이 요소에도 zIndex 지정
                    zIndex: 10002,
                }}
            >
                <button type="button" onClick={modalClose}>x</button>
                <form onSubmit={handleSubmit}>
                    <article>
                        <div className="item">
                            <div className="item-image">
                                <img
                                    src={paymentData.bookRoom.detail_urls[0]}
                                    alt="thumbnail"
                                    // className="md:h-[30rem] h-64 object-cover rounded-lg"
                                />
                            </div>
                            <div className="item-text">
                                <h5>{paymentData.bookRoom.title}</h5>
                                {/*<p>{Math.round(paymentData.price).toLocaleString()}원</p>*/}
                                <p>1000원</p>
                            </div>
                        </div>
                        <div className="price">
                            <label>총 구입 가격</label>
                            {/*{Math.round(paymentData.price).toLocaleString()}원*/}
                            1000원
                        </div>
                    </article>
                    <button
                        type="submit"
                        aria-busy={isWaitingPayment}
                        disabled={isWaitingPayment}
                    >
                        결제
                    </button>
                </form>
            </div>
            {paymentStatus.status === "FAILED" && (
                <dialog open>
                    <header>
                        <h1>결제 실패</h1>
                    </header>
                    <p>{paymentStatus.message}</p>
                    <button type="button" onClick={handleClose}>
                        닫기
                    </button>
                </dialog>
            )}
            <dialog open={paymentStatus.status === "PAID"}>
                <header>
                    <h1>결제 성공</h1>
                </header>
                <p>결제에 성공했습니다.</p>
                <button type="button" onClick={handleClose}>
                    닫기
                </button>
            </dialog>
        </Modal>
    )
}