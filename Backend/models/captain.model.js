import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const captainSchema = new mongoose.Schema(
    {
        fullname: {
            firstname: {
                type: String,
                required: true,
                minlength: 3,
                trim: true
            },

            lastname: {
                type: String,
                trim: true
            }
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^\S+@\S+\.\S+$/
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        verified: {
            type: Boolean,
            default: false
        },

        socketId: {
            type: String
        },

        status: {
            type: String,
            enum: ["offline", "online", "busy"],
            default: "offline"
        },

        vehicle: {
            color: {
                type: String,
                required: true,
                trim: true
            },

            plate: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                uppercase: true
            },

            capacity: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },

            vehicleType: {
                type: String,
                enum: ["car", "motorcycle", "auto"],
                required: true
            },
        },

        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        address: {
            type: String,
            required: true
        },

        ratings: {
            average: {
                type: Number,
                default: 0
            },

            totalRatings: {
                type: Number,
                default: 0
            }
        },

        earnings: {
            total: {
                type: Number,
                default: 0
            }
        },
        otpType: {
            type: String,
            select: false,
        },

        otp: {
            type: String,
            select: false
        },
        otpExpiresAt: {
            type: Date,
            select: false
        },
        tempEmail: {
            type: String
        },
        activeRide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ride',
            default: null
        },
        totalRides: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ride',
        }]
    },
    {
        timestamps: true
    }
);


captainSchema.methods.generateCaptainAuth = function () {
    return jwt.sign(
        {
            id: this._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

captainSchema.methods.goOnline = async function () {
    this.status = "online";
    return await this.save();
};

captainSchema.methods.goOffline = async function () {
    this.status = "offline";
    return await this.save();
};

captainSchema.methods.startRide = async function () {
    this.status = "busy";
    return await this.save();
};

captainSchema.methods.completeRide = async function () {
    this.status = "online";
    return await this.save();
};

captainSchema.methods.toPublicJSON = function () {
    return {
        _id: this._id,
        fullname: this.fullname,
        email: this.email,
        verified: this.verified,
        status: this.status,
        vehicle: this.vehicle,
        ratings: this.ratings,
        earnings: this.earnings,
        location: this.location,
        address: this.address,
        activeRide: this.activeRide,
        socketId: this.socketId
    };
};


captainSchema.methods.clearOtp = function () {
    this.otp = undefined;
    this.otpExpiresAt = undefined;
    this.otpType = undefined;
};

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

captainSchema.methods.compareOtp = function (otp) {
    if (new Date() > this.otpExpiresAt) {
        throw new Error("OTP has expired");
    }

    return this.otp === otp;
};
captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10)
};
captainSchema.methods.generateOtp = function (otpType) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.otp = otp;
    this.otpType = otpType
    this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return otp;
};
captainSchema.methods.isOtpExpired = function () {
    return new Date() > this.otpExpiresAt;
};
captainSchema.methods.updatePassword = async function (newPassword) {
    this.password = await bcrypt.hash(newPassword, 10);
    await this.save();
}
captainSchema.methods.updateEmail = async function () {
    this.email = this.tempEmail;
    this.tempEmail = undefined;
    await this.save();
}
captainSchema.methods.changeEmail = async function (email) {
    this.tempEmail = email;
    await this.save();
}

captainSchema.index({
    status: 1,
    "vehicle.vehicleType": 1,
    location: "2dsphere"
});
export const captainModel = mongoose.model(
    "Captain",
    captainSchema
);