import { transporter } from "../config/nodeMailer.js";
import { captainModel } from "../models/captain.model.js";

export const createCaptain = async ({
    firstname,
    lastname,
    email,
    password,
    address,
    vehicleType,
    color,
    plate,
    capacity
}) => {

    if (!firstname || !lastname || !email || !password || !address || !vehicleType || !color || !plate || !capacity) {
        throw new Error("all fields are required")
    }

    try {

        const existingCaptain = await captainModel.findOne({ email });

        if (existingCaptain) {
            throw new Error("captain already exists");
        }

        const hashPassword = await captainModel.hashPassword(password)

        email = email.toLowerCase().trim();

        const captain = await captainModel.create({ fullname: { firstname, lastname }, email, password: hashPassword, address, vehicle: { vehicleType, color, plate, capacity } })

        await captain.save()

        const MailOptions = {
            from: process.env.SENDER,
            to: email,
            subject: 'Welcome our Website',
            text: `Hi, captain your email is ${email} is successfully registered`
        }

        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {

            await captain.deleteOne();
            console.log(error);

            throw new Error("Unable to send verification email");

        }

        return captain;

    } catch (error) {
        console.log(error.message);
    }

}

export const loginCaptain = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("all fields are required")
    }

    try {

        const captain = await captainModel.findOne({ email }).select('+password');

        if (!captain) {
            return { success: false, message: 'captain not found' }
        }

        if (await captain.comparePassword(password)) {
            return { success: true, captain }
        } else {
            return { success: false, message: 'incorrect password' }
        }

    } catch (error) {
        console.log(error.message);
    }

}

export const verifyCaptain = async (otp, captainId, expectedType) => {
    try {

        const captain = await captainModel.findById(captainId).select('+otp +otpType +otpExpiresAt');

        if (!captain) {
            return { success: false, message: "captain not found" }
        }

        if (captain.verified) {
            return { success: false, message: "captain already verified" }
        }

        if (!otp && captain.otpExpiresAt && captain.otpExpiresAt > Date.now()) {

            return { success: false, message: "OTP already sent" }
        }

        if (!captain.otp || !captain.otpType) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (captain.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (captain.isOtpExpired()) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = captain.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is incorrect" }
        } else {
            captain.verified = true;
            captain.clearOtp();
            await captain.save()
        }

        return { success: true, captain };

    } catch (error) {
        console.log(error);
    }
}

export const sendVerifyOtp = async (captain, expectedType) => {

    if (!captain) {
        throw new Error("captain must be required")
    }

    try {

        const otp = captain.generateOtp(expectedType);


        await captain.save()
        const MailOptions = {
            from: process.env.SENDER,
            to: captain.email,
            subject: 'Email Verification OTP',
            text: `your email verification otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            throw new Error("Unable to send verification email");
        }

        return captain;

    } catch (error) {
        throw new Error(error.message);
    }
}

export const profileUpdate = async ({ firstname, lastname, address, vehicleType, color, capacity, plate }, captain) => {
    if (!firstname || !lastname || !address) {

        return { success: false, message: "all fields must be required" }
    }
    if (captain.fullname.firstname === firstname && captain.fullname.lastname === lastname && captain.address === address && captain.vehicle.vehicleType === vehicleType && captain.vehicle.color === color && captain.vehicle.capacity === capacity && captain.vehicle.plate === plate) {
        return { success: false, message: "Cannot update same data" }
    }
    try {
        const newCaptain = await captainModel.findByIdAndUpdate(captain._id, { fullname: { firstname, lastname }, address, vehicle: { vehicleType, color, plate, capacity } }, { returnDocument: 'after' });
        return { success: true, captain: newCaptain.toPublicJSON() }

    } catch (error) {
        return { success: false, message: error.message }
    }

}

export const sendPasswordResetOtp = async ({ email }, captainId) => {

    if (!email) {
        return { success: false, message: "email must be required" }
    }
    try {
        const captain = await captainModel.findById(captainId)
        const otp = captain.generateOtp('reset-password');

        await captain.save()
        const MailOptions = {
            from: process.env.SENDER,
            to: captain.email,
            subject: 'Password Reset OTP',
            text: `your password reset otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            return { success: false, message: "Unable to send verification email" }
        }

        return { success: true, captain: captain.toPublicJSON() }

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export const verifyResetOtp = async ({ otp }, captainId, expectedType, newPassword) => {
    if (!otp || !newPassword) {
        return { success: false, message: "otp and password must be required" }
    }

    try {

        const captain = await captainModel.findById(captainId).select('+otp +otpType +otpExpiresAt');

        if (!captain) {
            return { success: false, message: "captain not found" }
        }

        if (!captain.otp || !captain.otpType) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (captain.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (captain.isOtpExpired()) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = captain.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is incorrect" }
        } else {
            captain.clearOtp();
            await captain.save()
            captain.updatePassword(newPassword);
        }

        return { success: true, captain };

    } catch (error) {
        console.log(error);
    }

}

export const sendEmailChangeOtp = async ({ email }, captainId) => {
    if (!email) {
        return { success: false, message: "email must be required" }
    }
    try {
        const captain = await captainModel.findById(captainId)

        const existcaptain = await captainModel.findOne({ email });

        if (captain.email === email) {
            return { success: false, message: "Cannot update same email" }
        }

        if (existcaptain) {
            return { success: false, message: "this email already in use" }
        }


        const otp = captain.generateOtp('change-email');

        await captain.save()

        await captain.changeEmail(email);

        const MailOptions = {
            from: process.env.SENDER,
            to: captain.email,
            subject: 'Change Email OTP',
            text: `The change email otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            return { success: false, message: "Unable to send verification email" }
        }

        return { success: true, captain: captain.toPublicJSON(), message: "email change otp send successfully" }

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export const verifyChangeEmailOtp = async ({ otp }, captainId, expectedType) => {
    if (!otp) {
        return { success: false, message: "otp must be required" }
    }

    try {

        const captain = await captainModel.findById(captainId).select('+otp +otpType +otpExpiresAt');

        if (!captain) {
            return { success: false, message: "captain not found" }
        }

        if (!captain.otp || !captain.otpType) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (captain.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (captain.isOtpExpired()) {
            sendVerifyOtp(captain, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = captain.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is invalid" }
        } else {
            captain.clearOtp();
            await captain.save()
            captain.updateEmail();
        }

        return { success: true, captain, message: "email change successfully" };

    } catch (error) {
        console.log(error);
    }
}