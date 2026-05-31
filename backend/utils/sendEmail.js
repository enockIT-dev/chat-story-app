const sendEmail = async ({ to, subject, text }) => {
  console.log(`Email to ${to}: ${subject} - ${text}`)
  return true
}

module.exports = sendEmail
