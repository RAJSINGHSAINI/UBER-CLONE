export const requireVerification = (
    req,
    res,
    next
) => {

    const account =
        req.user ||
        req.captain;

    if (!account) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (!account.verified) {
        return res.status(403).json({
            success: false,
            message:
                "Account verification required"
        });
    }

    next();
};