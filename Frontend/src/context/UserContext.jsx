import React, { createContext, useState } from 'react'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [UserData, setUserData] = useState({})

    const [UserRideData,setUserRideData] = useState({})

    const [AcceptRideData, setAcceptRideData] = useState({})

    return (
        <div>
            <UserDataContext.Provider value={{ UserData, setUserData, isLoggedIn, setIsLoggedIn,UserRideData,setUserRideData,AcceptRideData,setAcceptRideData }}>
                {children}
            </UserDataContext.Provider>
        </div>
    )
}

export default UserContext