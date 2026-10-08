import { Submission } from "../models/submission.models.js"

export const saveFormSubmission = async (data, formName) => {
    try {
        await Submission.create(data);
        console.log(`${formName} saved`)
        return true
    } catch (error) {
        console.error(`${formName} MongoDB save failed: `, error);
        return false
    }
};