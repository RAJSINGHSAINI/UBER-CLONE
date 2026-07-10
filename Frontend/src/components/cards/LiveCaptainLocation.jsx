import React, { useEffect, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet';
import { useSocket } from '../../hooks/useSocket';
import { registerUserEvents, unregisterUserEvents } from '../../socket/socketEvents';
import { captainIcon } from '../../utils/MapIcons';

const LiveCaptainLocation = () => {

    const [CaptainLiveLocation, setCaptainLiveLocation] = useState(null)

    function CaptainMarker({ location }) {

        const markerRef = useRef();

        useEffect(() => {

            if (
                markerRef.current &&
                location
            ) {

                markerRef.current.setLatLng([
                    location.lat,
                    location.lng
                ]);
            }

        }, [location]);

        return (
            <Marker
                ref={markerRef}
                position={[
                    location?.lat || 0,
                    location?.lng || 0
                ]}
                icon={captainIcon}
            />
        );
    }

    const socket = useSocket()

    useEffect(() => {

        const handlers = {

            onLiveLocation: (data) => {
                setCaptainLiveLocation(data.location)
            }
        };
        registerUserEvents(
            socket,
            handlers
        );

        return () => {
            unregisterUserEvents(
                socket,
                handlers
            );
        };

    }, []);

    return (
        <CaptainMarker location={CaptainLiveLocation} />
    )
}

export default LiveCaptainLocation