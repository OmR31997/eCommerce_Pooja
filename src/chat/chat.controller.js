import { ChatBotReply_H } from "../../utils/chatbot.js";
import { FindUserFail_H, FindVendorFail_H } from "../../utils/helper.js";

export const chat_message = async (req, res, next) => {
    try {
        const message = req.body.message;

        const id = req.user?.id || null;
        const role = req.user?.role || "guest";
        
        let name = "Guest";
        
        if(role === "user" && id) {
            const user = await FindUserFail_H({ _id: id }, "name");
            name = user.name
        } else if(role === "vendor" && id) {
            const vendor = await FindVendorFail_H({ _id: id }, "userId.name");
            name = vendor.name
        }

        const {success, reply, lang} = await ChatBotReply_H(id, message, name, role);

        return res.status(200).json({
            reply,
            lang,
            success
        });

    } catch (error) {
        next(error);
    }
}