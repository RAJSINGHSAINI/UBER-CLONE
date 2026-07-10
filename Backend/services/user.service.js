import { userModel } from "../models/user.model.js"
import { transporter } from "../config/nodeMailer.js"

export const createUser = async ({
    firstname,
    lastname,
    email,
    password,
    address
}) => {

    if (!firstname || !lastname || !email || !password || !address) {
        return { success: false, message: "all fields must be required" }
    }

    try {


        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return { success: false, message: "User already exists" }
        }

        const hashPassword = await userModel.hashPassword(password)

        email = email.toLowerCase().trim();

        const user = await userModel.create({ fullname: { firstname, lastname }, email, password: hashPassword, address })


        await user.save()

        const MailOptions = {
            from: process.env.SENDER,
            to: email,
            subject: 'Welcome',
            text: `your email is ${user.email} is sucessfully registered `
        }


        transporter.sendMail(MailOptions)
            .catch(err => {
                console.error(err);

            });
        return { success: true, user }

    } catch (error) {
        console.log(error);
    }

}

export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        return { success: false, message: "all fields are required" }

    }

    try {

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return { success: false, message: "user not found" }
        }
        
        if (await user.comparePassword(password)) {
            return { success: true,user, message: "user login successfully" };
        } else {
            return { success: false, message: "email or password is invalid" };
        }

    } catch (error) {
        console.log(error.message);
    }

}

export const verifyUser = async (otp, userId, expectedType) => {

    try {

        const user = await userModel.findById(userId).select('+otp +otpType +otpExpiresAt');

        if (!user) {
            return { success: false, message: "user not found" }
        }

        if (user.verified) {
            return { success: false, message: "user already verified" }
        }

        if (!otp && user.otpExpiresAt && user.otpExpiresAt > Date.now()) {
                       
            return { success: false, message: "OTP already sent" }
        }

        if (!user.otp || !user.otpType) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (user.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (user.isOtpExpired()) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = user.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is invalid" }
        } else {
            user.verified = true;
            user.clearOtp();
            await user.save()
        }

        return { success: true, user };

    } catch (error) {
        console.log(error);
    }

}

export const sendVerifyOtp = async (user, expectedType) => {

    if (!user) {
        throw new Error("user must be required")
    }

    try {

        const otp = user.generateOtp(expectedType);


        await user.save()
        const MailOptions = {
            from: process.env.SENDER,
            to: user.email,
            subject: 'Email Verification OTP',
            text: `your email verification otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            throw new Error("Unable to send verification email");
        }

        return user;

    } catch (error) {
        throw new Error(error.message);
    }
}

export const profileUpdate = async ({ firstname, lastname, address }, user) => {
    if (!firstname || !lastname || !address) {

        return { success: false, message: "all fields must be required" }
    }
    if (user.fullname.firstname === firstname && user.fullname.lastname === lastname && user.address === address) {
        return { success: false, message: "Cannot update same data" }
    }
    try {
        await userModel.findByIdAndUpdate(user._id, { fullname: { firstname, lastname }, address });
        return { success: true, user }

    } catch (error) {
        return { success: false, message: error.message }

    }

}

export const sendPasswordResetOtp = async ({ email }) => {

    if (!email) {
        return { success: false, message: "email must be required" }
    }
    try {
        const user = await userModel.findOne({email})
        const otp = user.generateOtp('reset-password');
        
        if(!user){
            return { success: false, message: "user not found" }
        }

        await user.save()
        const MailOptions = {
            from: process.env.SENDER,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `your password reset otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            return { success: false, message: "Unable to send verification email" }
        }

        return { success: true, user: user.toPublicJSON() }

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export const verifyResetOtp = async ({ otp,email }, expectedType, newPassword) => {
    if (!otp || !newPassword) {
        return { success: false, message: "otp and password must be required" }
    }

    try {

        const user = await userModel.findOne({email}).select('+otp +otpType +otpExpiresAt');

        if (!user) {
            return { success: false, message: "user not found" }
        }

        if (!user.otp || !user.otpType) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (user.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (user.isOtpExpired()) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = user.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is invalid" }
        } else {
            user.clearOtp();
            await user.save()
            user.updatePassword(newPassword);
        }

        return { success: true, user };

    } catch (error) {
        console.log(error);
    }

}

export const sendEmailChangeOtp = async ({ email }, userId) => {
    if (!email) {
        return { success: false, message: "email must be required" }
    }
    try {
        const user = await userModel.findById(userId)

        const existUser = await userModel.findOne({ email });

        if (user.email === email) {
            return { success: false, message: "Cannot update same email" }
        }

        if (existUser) {
            return { success: false, message: "this email already in use" }
        }


        const otp = user.generateOtp('change-email');

        await user.save()

        await user.changeEmail(email);

        const MailOptions = {
            from: process.env.SENDER,
            to: user.email,
            subject: 'Change Email OTP',
            text: `The change email otp is ${otp}
            It expire after 10 min`
        }
        try {

            await transporter.sendMail(MailOptions);

        } catch (error) {
            return { success: false, message: "Unable to send verification email" }
        }

        return { success: true, user: user.toPublicJSON(), message: "email change otp send successfully" }

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export const verifyChangeEmailOtp = async ({ otp }, userId, expectedType) => {
    if (!otp) {
        return { success: false, message: "otp must be required" }
    }

    try {

        const user = await userModel.findById(userId).select('+otp +otpType +otpExpiresAt');

        if (!user) {
            return { success: false, message: "user not found" }
        }

        if (!user.otp || !user.otpType) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "new otp is send, enter new otp" }
        }

        if (user.otpType !== expectedType) {
            return { success: false, message: "invalid otp type" }
        }

        if (user.isOtpExpired()) {
            sendVerifyOtp(user, expectedType)
            return { success: false, message: "otp is expired, enter new otp" }
        }

        const isOtpVerify = user.compareOtp(otp);

        if (!isOtpVerify) {
            return { success: false, message: "otp is invalid" }
        } else {
            user.clearOtp();
            await user.save()
            user.updateEmail();
        }

        return { success: true, user, message: "email change successfully" };

    } catch (error) {
        console.log(error);
    }
}