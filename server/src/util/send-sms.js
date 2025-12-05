import Netgsm from "@netgsm/sms";
import logger from "../config/logger.js";

const netgsm = new Netgsm({
    username: process.env.NETGSM_NUMBER,
    password: process.env.NETGSM_PASSWORD,
    appname: ""
});

export async function sendSms({ msg, no }) {
    try {
        const response = await netgsm.sendRestSms({
            msgheader: process.env.NETGSM_NUMBER,
            encoding: "TR",
            messages: [{
                msg: msg,
                no: no
            }]
        });
        logger.info("SMS sent:", response);
        return response.jobid;
    } catch (error) {
        logger.error("❌ Failed to send SMS:", error);
        throw error;
    }
}