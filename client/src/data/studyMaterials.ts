export type StudyMaterial = {
id: number
title: string
subject: 'Physics' | 'Chemistry' | 'Mathematics'
chapter: string
type: 'Revision Notes' | 'Formula Sheet' | 'Concept Guide'
description: string
duration: string
content: string[]
resourceUrl?: string
}

export const studyMaterials: StudyMaterial[] = [
{
id: 1,
title: 'Kinematics: Quick Revision',
subject: 'Physics',
chapter: 'Kinematics',
type: 'Revision Notes',
description: 'Review displacement, velocity, acceleration, and motion equations.',
duration: '10 min',
content: [
'Displacement is the change in position. Distance is the total path length.',
'Average velocity = total displacement / total time.',
'Average speed = total distance / total time.',
'For constant acceleration: v = u + at.',
'Displacement under constant acceleration: s = ut + ½at².',
'Velocity-displacement relation: v² = u² + 2as.',
'The slope of a position-time graph gives velocity. The slope of a velocity-time graph gives acceleration.',
],
},
{
id: 2,
title: 'Newton’s Laws: Formula Sheet',
subject: 'Physics',
chapter: 'Laws of Motion',
type: 'Formula Sheet',
description: 'Important equations and concepts for force and motion problems.',
duration: '8 min',
content: [
'Newton’s first law describes inertia.',
'Newton’s second law: net force = rate of change of momentum. For constant mass, F = ma.',
'Newton’s third law: action and reaction forces are equal and opposite, acting on different bodies.',
'Weight near Earth’s surface: W = mg.',
'Static friction adjusts up to its maximum value: fs ≤ μsN.',
'Kinetic friction magnitude: fk = μkN.',
'Draw a free-body diagram before applying Newton’s laws.',
],
},
{
id: 3,
title: 'Atomic Structure: Concept Guide',
subject: 'Chemistry',
chapter: 'Atomic Structure',
type: 'Concept Guide',
description: 'Revise quantum numbers, orbitals, and electronic configurations.',
duration: '12 min',
content: [
'The principal quantum number n identifies the main shell and relates to orbital size and energy.',
'The azimuthal quantum number l identifies the subshell and orbital shape.',
'The magnetic quantum number ml identifies the orientation of an orbital.',
'The spin quantum number ms is +½ or −½.',
'An orbital can hold a maximum of two electrons with opposite spins.',
'The Pauli exclusion principle states that no two electrons in an atom have the same set of four quantum numbers.',
'Hund’s rule favours maximum unpaired electrons in degenerate orbitals before pairing.',
],
},
{
id: 4,
title: 'Chemical Bonding: Quick Revision',
subject: 'Chemistry',
chapter: 'Chemical Bonding',
type: 'Revision Notes',
description: 'Review hybridisation, molecular geometry, and bond concepts.',
duration: '12 min',
content: [
'An ionic bond forms through electrostatic attraction between oppositely charged ions.',
'A covalent bond involves sharing electron pairs.',
'A sigma bond results from head-on orbital overlap.',
'A pi bond results from sideways overlap of suitable orbitals.',
'sp hybridisation typically gives a linear arrangement.',
'sp² hybridisation typically gives a trigonal planar arrangement.',
'sp³ hybridisation typically gives a tetrahedral electron-pair arrangement.',
'Lone pairs can affect molecular shape and bond angles.',
],
},
{
id: 5,
title: 'Quadratic Equations: Formula Sheet',
subject: 'Mathematics',
chapter: 'Quadratic Equations',
type: 'Formula Sheet',
description: 'Important formulas and root relationships for quadratic equations.',
duration: '8 min',
content: [
'For ax² + bx + c = 0, where a ≠ 0, the roots are x = (−b ± √(b² − 4ac)) / 2a.',
'The discriminant is D = b² − 4ac.',
'D > 0 gives two distinct real roots; D = 0 gives equal real roots; D < 0 gives non-real complex conjugate roots for real coefficients.',
'Sum of roots: α + β = −b/a.',
'Product of roots: αβ = c/a.',
'The quadratic graph is a parabola.',
'The axis of symmetry is x = −b/(2a).',
],
},
{
id: 6,
title: 'Differentiation: Quick Revision',
subject: 'Mathematics',
chapter: 'Differentiation',
type: 'Revision Notes',
description: 'Revise standard derivatives and differentiation rules.',
duration: '10 min',
content: [
'd(c)/dx = 0 for a constant c.',
'd(xⁿ)/dx = nxⁿ⁻¹.',
'd(sin x)/dx = cos x.',
'd(cos x)/dx = −sin x.',
'Product rule: d(uv)/dx = u(dv/dx) + v(du/dx).',
'Quotient rule: d(u/v)/dx = [v(du/dx) − u(dv/dx)] / v², where v ≠ 0.',
'Chain rule: d[f(g(x))]/dx = f′(g(x))g′(x).',
],
},
]
