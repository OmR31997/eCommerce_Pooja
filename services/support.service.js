import { Complaint } from '../models/complaint.model.js';
import { NotifyAdmins } from './admin.service.js';

export const CreateComplaint = async (complainData) => {
    const data = await Complaint.create(complainData);

    // Notification to admins
    await NotifyAdmins({
        title: 'New Complaint',
        type: 'complaint',
        message: `Ticket No. is [${ticket._id}], \n${ticket.subject}`,
    });

    return {
        status: 201,
        message: 'Compltaint registered successfully',
        data,
        success: true
    };
}

export const GetComplaints = async () => {
    const complaints = await Complaint.find().lean();

    if (complaints.length === 0) {
        throw {
            status: 404,
            message: `Complaint not found`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data:complaints, success: true };
}

export const GetComplaintById = async (ticketId) => {
    const complaint = await Complaint.findById(ticketId).lean();

    if (!complaint) {
        throw {
            status: 404,
            message: `Complaint not found for ticketID: ${ticketId}`
        }
    }

    return { status: 200, message: 'Data fetched successfully', data:complaint, success: true };
}

export const UpdateComplaintById = async (ticketId, message) => {
    const complaint = await Complaint.findByIdAndUpdate(ticketId, message);

    if (!complaint) {
        throw {
            status: 404,
            message: `Complaint not found for ticketID: ${ticketId}`
        }
    }

    return { status: 200, message: 'Complaint updated successfully', data:message, success: true };
}

export const DeleteComplaintById = async (ticketId) => {
    const complaint = await Complaint.findByIdAndDelete(ticketId).lean();

    if (!complaint) {
        throw {
            status: 404,
            message: `Complaint not found for ticketID: ${ticketId}`
        }
    }

    return { status: 200, message: 'Complaint deleted successfully', data:complaint, success: true };
}