declare module "src/components/pay/Checkout.jsx" {
    import React from "react";
    import {MyReservation} from "./reservation";
    import {RoomData} from "./rooms";

    interface FormDataState {
        name: string,
        phone: string,
        email: string,
        currency: string,
    }

    interface PaymentData {
        bookReservation: MyReservation,
        bookRoom: RoomData,
        formDataState: FormDataState,
        price: number,
    }

    interface CheckoutPageProps {
        paymentData: PaymentData,
        modalOpen: boolean,
        modalClose: () => void
    }

    export const CheckoutPage: React.FC<CheckoutPageProps>;
}