import React, { createContext, useState } from 'react'

export const CaptainDataContext = createContext()

const CaptainContext = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [CaptainData, setCaptainData] = useState({})

    const [acceptRideData, setAcceptRideData] = useState(null)

    return (
        <div>
            <CaptainDataContext.Provider value={{ CaptainData, setCaptainData, isLoggedIn, setIsLoggedIn, acceptRideData, setAcceptRideData }}>
                {children}
            </CaptainDataContext.Provider>
        </div>
    )
}

export default CaptainContext