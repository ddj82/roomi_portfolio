// import {ANONYMOUS, loadTossPayments} from "@tosspayments/tosspayments-sdk";
// import { useEffect, useState } from "react";
//
// // TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// // TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
// const customerKey = generateRandomString();
//
// export function CheckoutPage({ paymentData }) {
//   const [amount, setAmount] = useState({
//     currency: "",
//     value: 0,
//   });
//   const [ready, setReady] = useState(false);
//   const [widgets, setWidgets] = useState(null);
//   const [reservation, setReservation] = useState(null);
//   const [room, setRoom] = useState(null);
//   const [form, setForm] = useState(null);
//
//   useEffect(() => {
//     async function fetchPaymentWidgets() {
//       try {
//         // ------  SDK 초기화 ------
//         const tossPayments = await loadTossPayments(clientKey);
//
//         // 회원 결제
//         const widgets = tossPayments.widgets({
//           customerKey,
//         });
//         // 비회원 결제
//         // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
//
//         setWidgets(widgets);
//       } catch (error) {
//         console.error("Error fetching payment widget:", error);
//       }
//     }
//
//     fetchPaymentWidgets();
//     setReservation(paymentData.bookData.reservation);
//     setRoom(paymentData.bookData.room);
//     setForm(paymentData.formDataState);
//     setAmount({
//       // currency: paymentData.formDataState.currency,
//       currency: 'KRW',
//       // value: paymentData.price,
//       value: Math.round(paymentData.price),
//     });
//   }, [clientKey, customerKey]);
//
//   useEffect(() => {
//     async function renderPaymentWidgets() {
//       if (widgets == null) {
//         return;
//       }
//
//       // ------  주문서의 결제 금액 설정 ------
//       // TODO: 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
//       setAmount({
//         // currency: paymentData.formDataState.currency,
//         currency: 'KRW',
//         // value: paymentData.price,
//         value: Math.round(paymentData.price),
//       });
//       await widgets.setAmount(amount);
//
//       // ------  결제 UI 렌더링 ------
//       // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
//       await widgets.renderPaymentMethods({
//         selector: "#payment-method",
//         // 렌더링하고 싶은 결제 UI의 variantKey
//         // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
//         // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
//         variantKey: "DEFAULT",
//       });
//
//       // ------  이용약관 UI 렌더링 ------
//       // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
//       await widgets.renderAgreement({
//         selector: "#agreement",
//         variantKey: "AGREEMENT",
//       });
//
//       setReady(true);
//     }
//
//     renderPaymentWidgets();
//   }, [widgets]);
//
//   const updateAmount = async (amount) => {
//     setAmount(amount);
//     await widgets.setAmount(amount);
//   };
//
//   return (
//     <div className="wrapper">
//       <div className="box_section">
//         {/* 결제 UI */}
//         <div id="payment-method" />
//         {/* 이용약관 UI */}
//         <div id="agreement" />
//
//         {/* 결제하기 버튼 */}
//         <div className="flex justify-end">
//           <button
//             className="button border text-sm text-white bg-roomi rounded mr-4 p-2"
//             disabled={!ready}
//             // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
//             // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
//             onClick={async () => {
//               try {
//                 // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
//                 // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
//                 // if (amount.currency === 'KRW') {
//                   await widgets.requestPayment({
//                     orderId: reservation.order_id,
//                     orderName: room.title,
//                     successUrl: window.location.origin + "/success",
//                     failUrl: window.location.origin + "/fail",
//                     customerEmail: form.email,
//                     customerName: form.name,
//                     customerMobilePhone: form.phone,
//                   });
//                 // } else {
//                 //   await widgets.requestPayment({
//                 //     orderId: reservation.order_id,
//                 //     orderName: room.title,
//                 //     successUrl: window.location.origin + "/success",
//                 //     failUrl: window.location.origin + "/fail",
//                 //     customerEmail: form.email,
//                 //     customerName: form.name,
//                 //     customerMobilePhone: form.phone,
//                 //     card: {
//                 //       useInternationalCardOnly: true,
//                 //     },
//                 //   });
//                 // }
//               } catch (error) {
//                 // 에러 처리하기
//                 console.error(error);
//               }
//             }}
//           >
//             결제하기
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// function generateRandomString() {
//   return window.btoa(Math.random().toString()).slice(0, 20);
// }
//


//KG_inicis

import { useEffect } from "react";

export function CheckoutPage({ paymentData }) {
  useEffect(() => {
    const runPayment = () => {
      console.log("paymentData", paymentData);

        const { IMP } = window;
      if (!IMP) {
        console.error("❌ IMP가 아직 로드되지 않았습니다.");
        return;
      }

      IMP.init("imp19424728"); // 본인 가맹점 코드

      const reservation = paymentData.bookData.reservation;
      const room = paymentData.bookData.room;
      const form = paymentData.formDataState;
      const pgCode = "html5_inicis"; // 테스트용 PG사 코드
      console.log(`pgCode : ${pgCode}`)
      IMP.request_pay(
          {
            // 올바른 PG사 코드 설정
            pg: pgCode, // 이니시스 테스트 모드 (MID와 일치시킴)
            // 또는 다음 형식 사용:
            // pg: "inicis.{상점아이디}", // 실제 상점아이디 필요

            pay_method: "card", // 결제 수단 추가
            merchant_uid: reservation.order_id,
            name: room.title,
            amount: Math.round(paymentData.price),
            currency: form.currency || "KRW",
            buyer_name: form.name,
            buyer_email: form.email,
            buyer_tel: form.phone,
            buyer_addr: form.address || "",
            buyer_postcode: "00000",
            // 모바일 리다이렉트 URL
            m_redirect_url: window.location.origin + "/success.html",
          },
          function (rsp) {
            if (rsp.success) {
              console.log("✅ 결제 성공", rsp);
              // TODO: 서버에 imp_uid, merchant_uid 전달해서 검증 요청
              // 성공 시 리디렉션
              window.location.href = window.location.origin + "/success.html?imp_uid=" + rsp.imp_uid + "&merchant_uid=" + rsp.merchant_uid;
            } else {
              console.error("❌ 결제 실패", rsp);
              // 실패 시 에러 메시지 표시
              alert("결제에 실패했습니다: " + rsp.error_msg);
            }
          }
      );
    };

    // IMP 스크립트가 로드된 후 실행되도록 약간의 지연 추가
    if (typeof window.IMP === "undefined") {
      // 스크립트가 없으면 먼저 로드
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/v1/iamport.js";
      script.async = true;
      document.head.appendChild(script);

      const interval = setInterval(() => {
        if (window.IMP) {
          clearInterval(interval);
          runPayment();
        }
      }, 300); // 0.3초 간격으로 확인
    } else {
      runPayment();
    }
  }, [paymentData]);

  return (
      <div style={{
        position: 'fixed', // 화면 전체 기준
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999, // 웬만한 위에 뜸
        pointerEvents: 'none' // 👉 클릭 막지 않도록!
      }}>
        <div style={{
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTop: '4px solid #3498db',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>

        <style>
          {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
        </style>
      </div>
  );
}


