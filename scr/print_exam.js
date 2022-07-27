import tests from './jose-drouilly';

const printExercise = (exerciseNumber) => {
    const exercise = tests[exerciseNumber];

    if (!exercise) return console.log(`${exerciseNumber} No es un ejercicio válido, ingrese un ejercicio entre 0 y 9.`);

    const { description, fn } = exercise;

    console.log(description);
    console.log(fn());
};

module.exports = printExercise;
