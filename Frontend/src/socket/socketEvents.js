export const registerCaptainEvents = (
    socket,
    handlers
) => {

    if (handlers.onNewRide) {
        socket.on(
            "new-ride",
            handlers.onNewRide
        );
    }

    if (handlers.onSubmitFeedback) {
        socket.on(
            "feedback-submitted",
            handlers.onSubmitFeedback
        );
    }
    
    if (handlers.onAcceptRide) {
        socket.on(
            'on-accept',
            handlers.onAcceptRide
        )
    }
    
    if (handlers.onCancelRide) {
        socket.on(
            'ride-cancelled',
            handlers.onCancelRide
        )
    }
    
    if (handlers.onGetContact) {
        socket.on(
            'contact-shared',
            handlers.onGetContact
        )
    }
    
    if (handlers.onRideCompleted) {
        socket.on(
            'ride-completed',
            handlers.onRideCompleted
        )
    }
    
};

export const unregisterCaptainEvents = (
    socket,
    handlers
) => {
    
    if (handlers.onNewRide) {
        socket.off(
            "new-ride",
            handlers.onNewRide
        );
    }
    if (handlers.onSubmitFeedback) {
        socket.off(
            "feedback-submitted",
            handlers.onSubmitFeedback
        );
    }
    
    if (handlers.onAcceptRide) {
        socket.off(
            'on-accept',
            handlers.onAcceptRide
        )
    }

    if (handlers.onCancelRide) {
        socket.off(
            'ride-cancelled',
            handlers.onCancelRide
        )
    }

    if (handlers.onGetContact) {
        socket.off(
            'contact-shared',
            handlers.onGetContact
        )
    }

    if (handlers.onRideCompleted) {
        socket.off(
            'ride-completed',
            handlers.onRideCompleted
        )
    }
};


export const registerUserEvents = (
    socket,
    handlers
) => {

    if (handlers.onAcceptRide) {
        socket.on(
            "captain-accepted",
            handlers.onAcceptRide
        );
    }

    if (handlers.onLiveLocation) {
        socket.on(
            "captain-live-location",
            handlers.onLiveLocation
        )
    }

    if (handlers.onCancelRide) {
        socket.on(
            'ride-cancelled',
            handlers.onCancelRide
        )
    }

    if (handlers.onRequestNumber) {
        socket.on(
            'captain-requested',
            handlers.onRequestNumber
        )
    }

    if (handlers.onOtpVerify) {
        socket.on(
            'otp-verified',
            handlers.onOtpVerify
        )
    }

    if (handlers.onRideCompleted) {
        socket.on(
            'ride-completed',
            handlers.onRideCompleted
        )
    }

};

export const unregisterUserEvents = (
    socket,
    handlers
) => {

    if (handlers.onAcceptRide) {
        socket.off(
            "captain-accepted",
            handlers.onAcceptRide

        );
    }

    if (handlers.onLiveLocation) {
        socket.off(
            "captain-live-location",
            handlers.onLiveLocation
        )
    }

    if (handlers.onCancelRide) {
        socket.off(
            'ride-cancelled',
            handlers.onCancelRide
        )
    }
    if (handlers.onRequestNumber) {
        socket.off(
            'captain-requested',
            handlers.onRequestNumber
        )
    }

    if (handlers.onOtpVerify) {
        socket.off(
            'otp-verified',
            handlers.onOtpVerify
        )
    }

    if (handlers.onRideCompleted) {
        socket.off(
            'ride-completed',
            handlers.onRideCompleted
        )
    }

    if (handlers.onRideStarted) {
        socket.off(
            "ride-started",
            handlers.onRideStarted
        );
    }

    if (handlers.onRideCompleted) {
        socket.off(
            "ride-completed",
            handlers.onRideCompleted
        );
    }
};