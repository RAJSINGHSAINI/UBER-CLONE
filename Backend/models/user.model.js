import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            minlength: 3,
            required: true
        },
        lastname: {
            type: String,
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
        select: false,
    },

    otpType: {
        type: String,
        select: false,
    },

    otp: {
        type: String,
        select: false
    },

    verified: {
        type: Boolean,
        default: false
    },

    socketId: {
        type: String
    },

    otpExpiresAt: {
        type: Date,
        select: false
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
    tempEmail: {
        type: String
    },
    activeRide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        default: null
    }
}, {
    timestamps: true
})


userSchema.methods.generateUserAuth = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.compareOtp = function (otp) {
    if (new Date() > this.otpExpiresAt) {
        throw new Error("OTP has expired");
    }

    return this.otp === otp;
};
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10)
};

userSchema.methods.generateOtp = function (otpType) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.otp = otp;
    this.otpType = otpType
    this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return otp;
};

userSchema.methods.isOtpExpired = function () {
    return new Date() > this.otpExpiresAt;
};

userSchema.methods.toPublicJSON = function () {
    return {
        _id: this._id,
        fullname: this.fullname,
        email: this.email,
        verified: this.verified,
        address: this.address,
        activeRide: this.activeRide,
        socketId: this.socketId,
        location: this.location
    };
};

userSchema.methods.clearOtp = function () {
    this.otp = undefined;
    this.otpExpiresAt = undefined;
    this.otpType = undefined;
};
userSchema.methods.updatePassword = async function (newPassword) {
    this.password = await bcrypt.hash(newPassword, 10);
    await this.save();
}
userSchema.methods.updateEmail = async function () {
    this.email = this.tempEmail;
    this.tempEmail = undefined;
    await this.save();
}
userSchema.methods.changeEmail = async function (email) {
    this.tempEmail = email;
    await this.save();
}
export const userModel = mongoose.model("User", userSchema)