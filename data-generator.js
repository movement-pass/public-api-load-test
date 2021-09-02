const dayjs = require('dayjs');
const faker = require('faker');

const Districts = require('./data/locations.json');
const Genders = require('./data/genders');
const IdTypes = require('./data/id-types');
const Reasons = require('./data/reasons');

const generateRandomData = (context, events, done) => {
    const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];
    const generateNumber = (max) => faker.datatype.number(max).toString().padStart(max.toString().length, '0');

    const mobilePhone = `015${generateNumber(99999999)}`;
    const registerDistrict = pickRandom(Districts);
    const registerThana = pickRandom(registerDistrict.thanas);

    const dateOfBirth = dayjs(faker.date.past(30, dayjs().subtract(18, 'years').toDate()));

    const register = {
        mobilePhone,
        name: 'Applicant',
        district: registerDistrict.id,
        thana: registerThana.id,
        dateOfBirth: dayjs(dateOfBirth).format('YYYY-MM-DD'),
        gender: pickRandom(Object.keys(Genders)),
        idType: pickRandom(Object.keys(IdTypes)),
        idNumber: generateNumber(9999999999999999)
    };

    const login = {
        mobilePhone,
        dateOfBirth: dateOfBirth.format('DDMMYYYY')
    };

    const applyDistrict = pickRandom(Districts);
    const applyThana = pickRandom(registerDistrict.thanas);

    const apply = {
        fromLocation: `Location A, ${registerThana.en}, ${registerDistrict.en}`,
        toLocation: 'Location B',
        district: applyDistrict.id,
        thana: applyThana.id,
        dateTime: dayjs(faker.date.soon()).toISOString(),
        durationInHour: pickRandom(Array.from({ length: 12 }, (_, n) => n + 1)),
        type: pickRandom(['R', 'O']),
        reason: pickRandom(Reasons).en,
        includeVehicle: false
    };

    context.vars.register = register;
    context.vars.login = login;
    context.vars.apply = apply;

    return done();
};

module.exports = {
    generateRandomData
};
