// Helper function to check if user is admin
const isAdminEmail = (email) => {
  const adminEmails = process.env.ADMIN_EMAILS ? 
    process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
    [];
  return adminEmails.includes(email.toLowerCase());
};

module.exports = { isAdminEmail };
