import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const BottomSheet = ({
    isOpen,
    children
}) => {

    const sheetRef = useRef(null)

    useGSAP(() => {

        gsap.set(
            sheetRef.current,
            {
                y: '70vh'
            }
        )

    }, [])

    useGSAP(() => {

        gsap.to(
            sheetRef.current,
            {
                y: isOpen ? 0 : '70vh',
                duration: .4,
                ease: 'power3.out'
            }
        )

    }, [isOpen])

    return (
        <div
            ref={sheetRef}
            className='
                fixed
                bottom-0
                left-0
                right-0
                h-dvh
                bg-white
                rounded-t-3xl
                z-100
                shadow-2xl
                overflow-hidden
                lg:hidden
            '
        >
            <div className='h-full overflow-y-auto'>
                {children}
            </div>
        </div>
    )
}

export default BottomSheet