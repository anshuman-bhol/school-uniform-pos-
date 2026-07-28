const userDTO = (user) => {

    return {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: user.role,

        status: user.status,

        approvedBy: user.approvedBy,

        approvedAt: user.approvedAt,

        rejectionReason: user.rejectionReason,

        createdAt: user.createdAt,

        updatedAt: user.updatedAt,

    };

};

module.exports = userDTO;