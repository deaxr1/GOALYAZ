const playersDB = [
    { id: 1, name: "TURQAY", rating: 97, type: "toty", position: "ST", buyPrice: 100000 },
    { id: 2, name: "ELCAN", rating: 97, type: "toty", position: "RW", buyPrice: 100000 },
    { id: 3, name: "TUNCAY", rating: 97, type: "toty", position: "CB", buyPrice: 100000 },
    { id: 4, name: "NAZRIN", rating: 93, type: "toty", position: "CB", buyPrice: 85000 },
    { id: 5, name: "BUGDAY", rating: 95, type: "toty", position: "GK", buyPrice: 92000 },
    { id: 6, name: "AYLA", rating: 30, type: "silver", position: "GK", buyPrice: 2500 },
    { id: 7, name: "RAUL", rating: 3, type: "bronze", position: "ST", buyPrice: 500 },
    { id: 8, name: "TURQAY", rating: 92, type: "gold", position: "ST", buyPrice: 43720 },
    { id: 9, name: "ELCAN", rating: 92, type: "gold", position: "RW", buyPrice: 43720 },
    { id: 10, name: "TUNCAY", rating: 90, type: "gold", position: "CB", buyPrice: 38299 },
    { id: 11, name: "BUGDAY", rating: 87, type: "gold", position: "GK", buyPrice: 33000 },
    { id: 12, name: "NAZRIN", rating: 82, type: "gold", position: "CB", buyPrice: 23000 },
    { id: 13, name: "SELIM", rating: 68, type: "gold", position: "CB", buyPrice: 9200 },
    { id: 14, name: "BAYTURAN", rating: 85, type: "gold", position: "ST", buyPrice: 87350 },
    { id: 15, name: "CAXANGIR", rating: 68, type: "gold", position: "CB", buyPrice: 9200 },
    { id: 16, name: "BUGDAY", rating: 90, type: "cl", position: "GK", buyPrice: 44600 },
    { id: 17, name: "NAZRIN", rating: 88, type: "cl", position: "CB", buyPrice: 41900 },
    { id: 18, name: "TUNCAY", rating: 91, type: "cl", position: "CB", buyPrice: 48060 },
    { id: 19, name: "TURQAY", rating: 96, type: "cl", position: "ST", buyPrice: 55000 },
    { id: 20, name: "ELCAN", rating: 96, type: "cl", position: "RW", buyPrice: 55000 },

];

let mySquad = [];

const teamsDB = [
    { id: 'toxic', name: 'TOXIC FC', power: 85, logo: 'img/teams/toxic_fc.png' },
    { id: 'cheerleaders', name: 'CHEERLEADERS FC', power: 87, logo: 'img/teams/cheerleaders_fc.png' },
    { id: 'qarabag', name: 'Qarabag FK', power: 80, logo: 'img/teams/qarabag.png' },
    { id: 'real_madrid', name: 'Real Madrid', power: 95, logo: 'img/teams/real_madrid.png' },
    { id: 'barcelona', name: 'Barcelona', power: 93, logo: 'img/teams/barcelona.png' },
    { id: 'liverpool', name: 'Liverpool', power: 92, logo: 'img/teams/liverpool.png' },
    { id: 'man_city', name: 'Man City', power: 96, logo: 'img/teams/man_city.png' },
    { id: 'man_utd', name: 'Man United', power: 88, logo: 'img/teams/man_utd.png' },
    { id: 'inter', name: 'Inter Milan', power: 90, logo: 'img/teams/inter_milan.png' },
    { id: 'psg', name: 'PSG', power: 91, logo: 'img/teams/psg.png' },
    { id: 'bayern', name: 'Bayern', power: 94, logo: 'img/teams/bayern.png' },
    { id: 'atletico', name: 'Atletico Madrid', power: 89, logo: 'img/teams/atletico_madrid.png' },
    { id: 'chelsea', name: 'Chelsea', power: 87, logo: 'img/teams/chelsea.png' },
    { id: 'ajax', name: 'Ajax', power: 85, logo: 'img/teams/ajax.png' }
];

let activeMatches = [];

let notifications = [];
