const submitButton = document.querySelector('.js-submit-button');
submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  const results = getUserInputs();
  if (!results) {
    alert('Insufficient Data - Please fill in all required fields');
    return;
  }
  console.log(results);
  
});
const getUserInputs = () => {
  const student = [];
  
  try {
    const marks1Element = document.getElementById('marks1');
    const marks2Element = document.getElementById('marks2');
    const marks3Element = document.getElementById('marks3');
    const attendanceElement = document.getElementById('attendance');
    const feeElement = document.querySelector('input[name="fee"]:checked');
    const loanElement = document.querySelector('input[name="loan"]:checked');
    const yearlyIncomeElement = document.getElementById('yearly-income');
    const yearlyFeesElement = document.getElementById('yearly-fee');

    const marks1 = Number(marks1Element.value.trim());
    const marks2 = Number(marks2Element.value.trim());
    const marks3 = Number(marks3Element.value.trim());
    const attendance = Number(attendanceElement.value.trim());
    const fee_paid_flag = Number(feeElement.value.trim());
    const edu_loan_flag = Number(loanElement.value.trim());
    const yearly_income = Number(yearlyIncomeElement.value.trim());
    const yearly_fees = Number(yearlyFeesElement.value.trim());
    
    student.push(marks1, marks2, marks3, attendance, fee_paid_flag, edu_loan_flag, yearly_income, yearly_fees);
    return student;
    
  } catch (error) {
    console.error('Error getting user inputs:', error);
    return null;
  }
};