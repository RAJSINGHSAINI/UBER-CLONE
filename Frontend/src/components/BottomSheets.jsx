// components/BottomSheet.jsx

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BottomSheets = ({
    isOpen,
    children,
    className = ""
}) => {

    const sheetRef = useRef(null);

    
    useGSAP(() => {

        if (!sheetRef.current) return;

        if (isOpen) {

            gsap.to(
                sheetRef.current,
                {
                    y: "0%",
                    duration: 0.35,
                    ease: "power3.out"
                }
            );

        } else {

            gsap.to(
                sheetRef.current,
                {
                    y: "100%",
                    duration: 0.3,
                    ease: "power2.in"
                }
            );

        }

    }, [isOpen]);

    return (
        <div
            ref={sheetRef}
            className={`
                fixed
                bottom-0
                left-0
                right-0
                z-150
                translate-y-full
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default BottomSheets;