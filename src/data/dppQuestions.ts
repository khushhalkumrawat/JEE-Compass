import type { Question } from '../types/test'

export const dppQuestions: Question[] = [
{
id: 101,
question: 'A body starts from rest and accelerates uniformly at 2 m/s². What is its velocity after 5 seconds?',
options: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'],
correctAnswer: '10 m/s',
type: 'SINGLE_CORRECT',
subject: 'Physics',
topic: 'Kinematics',
marks: 4,
negativeMarks: 1,
explanation:
'Using v = u + at, with u = 0, a = 2 m/s² and t = 5 s, we get v = 10 m/s.',
},
{
id: 102,
question: 'A particle has an initial velocity of 4 m/s and acceleration of 3 m/s². What is its displacement in 2 seconds?',
options: ['8 m', '10 m', '12 m', '14 m'],
correctAnswer: '14 m',
type: 'SINGLE_CORRECT',
subject: 'Physics',
topic: 'Kinematics',
marks: 4,
negativeMarks: 1,
explanation:
'Using s = ut + ½at², s = 4(2) + ½(3)(2²) = 8 + 6 = 14 m.',
},
{
id: 103,
question: 'Which quantum number determines the shape of an atomic orbital?',
options: [
'Principal quantum number',
'Azimuthal quantum number',
'Magnetic quantum number',
'Spin quantum number',
],
correctAnswer: 'Azimuthal quantum number',
type: 'SINGLE_CORRECT',
subject: 'Chemistry',
topic: 'Atomic Structure',
marks: 4,
negativeMarks: 1,
explanation:
'The azimuthal quantum number (l) determines the subshell and shape of an orbital.',
},
{
id: 104,
question: 'How many sigma bonds are present in a methane (CH₄) molecule?',
options: ['1', '2', '3', '4'],
correctAnswer: '4',
type: 'SINGLE_CORRECT',
subject: 'Chemistry',
topic: 'Chemical Bonding',
marks: 4,
negativeMarks: 1,
explanation:
'Methane has four C–H single bonds, and each single bond contains one sigma bond.',
},
{
id: 105,
question: 'If the roots of x² − 7x + 12 = 0 are α and β, what is α + β?',
options: ['3', '4', '7', '12'],
correctAnswer: '7',
type: 'SINGLE_CORRECT',
subject: 'Mathematics',
topic: 'Quadratic Equations',
marks: 4,
negativeMarks: 1,
explanation:
'For ax² + bx + c = 0, the sum of roots is −b/a. Therefore, α + β = 7.',
},
{
id: 106,
question: 'The derivative of x³ with respect to x is:',
options: ['x²', '2x', '3x²', '3x'],
correctAnswer: '3x²',
type: 'SINGLE_CORRECT',
subject: 'Mathematics',
topic: 'Differentiation',
marks: 4,
negativeMarks: 1,
explanation:
'By the power rule, d(xⁿ)/dx = nxⁿ⁻¹. Therefore, d(x³)/dx = 3x².',
},
]
