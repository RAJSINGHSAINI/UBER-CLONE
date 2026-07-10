import mongoose from 'mongoose'

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Captain",
        default: null
    },

    pickup: {
        address: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },

            coordinates: {
                type: [Number], // [lng, lat]
                required: true
            }
        }
    },

    destination: {
        address: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },

    vehicleType: String,

    fare: Number,

    status: {
        type: String,
        enum: [
            "searching",
            "accepted",
            "ongoing",
            "arrived",
            "completed",
            "cancelled",
            "expired"
        ],
        default: "searching"
    },
    verifyOTP: {
        type: String,
        select: false
    },

    verifyOTPGenerated: {
        type: Boolean,
        default: false
    },

    verifyOTPGeneratedAt: {
        type: Date
    },

    distance: Number,
    duration: Number,

    vehicleType: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        index: {
            expires: 0
        }
    },
    searchExpiresAt: {
        type: Date,
        required: true
    },
    deleteAfter: {
        type: Date,
        required: true
    },
    cancelledBy: {
        type: String
    },

    cancelledAt: {
        type: Date
    },
    contactRequestCooldownUntil : {
        type: Date
    },
    contactShareCooldownUntil:{
        type:Date
    },
    captainRating: {
        type: Number
    }
},
    {
        timestamps: true
    });


rideSchema.methods.canBeAccepted =
    function () {
        return this.status === "searching";
    };

rideSchema.methods.isCompleted =
    function () {
        return this.status === "completed";
    };

rideSchema.methods.isCancelled =
    function () {
        return this.status === "cancelled";
    };

rideSchema.methods.isOngoing =
    function () {
        return this.status === "ongoing";
    };

    
rideSchema.index({
    status: 1
});

rideSchema.index({
    user: 1
});

rideSchema.index({
    captain: 1
});
rideSchema.index({
    "pickup.location": "2dsphere"
});
export const rideModel = mongoose.model('ride', rideSchema)