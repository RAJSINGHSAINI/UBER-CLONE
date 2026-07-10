import mongoose from "mongoose";

const BlacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // TTL index: document will be removed 24 hours after createdAt
        expires: 24 * 60 * 60, // seconds
    },
});

export const BlacklistToken = mongoose.model('BlacklistToken', BlacklistTokenSchema);
