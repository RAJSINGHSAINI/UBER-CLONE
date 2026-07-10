import { Marker, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";

function LiveCaptainMarker({
    currentLocationRef
}) {

    const markerRef =
        useRef(null);

    const map =
        useMap();

    useEffect(() => {

        const interval =
            setInterval(() => {

                const location =
                    currentLocationRef.current;

                if (
                    location &&
                    markerRef.current
                ) {

                    markerRef.current.setLatLng([
                        location.lat,
                        location.lng
                    ]);

                    map.flyTo(
                        [
                            location.lat,
                            location.lng
                        ],
                        18,
                        {
                            animate: true
                        }
                    );
                }

            }, 1000);

        return () =>
            clearInterval(interval);

    }, []);

    return (
        <Marker
            ref={markerRef}
            position={[0, 0]}
        />
    );
}

export default LiveCaptainMarker;