// по часовой
// const points1 =  [ 
//     [ 53, 52 ], // 105
//     [ 206, 48 ], // 254
//     [ 209, 238 ], // 447 
//     [ 47, 243 ]  // 290 
// ]

// // против часовой
// const points2 = [ 
//     [ 342, 65 ], // 407
//     [ 343, 220 ], // 563
//     [ 516, 223 ], // 739
//     [ 510, 64 ] // 574
// ]

// points1.forEach (point

// )

var points = [
    [ 5,0 ], // 105
    [ 6,4 ], // 254
    [ 4,5 ], // 447 
    [ 1,5 ],
    [ 1,0 ]
]

const clockwise = 
(points[1][0] - points[0][0]) * (points[1][1] + points[0][1]) +
(points[2][0] - points[1][0]) * (points[2][1] + points[1][1]) + 
(points[3][0] - points[2][0]) * (points[3][1] + points[2][1]) +
(points[4][0] - points[3][0]) * (points[4][1] + points[4][1]) 


console.log(clockwise)

// function isClockwise(points) {
//     if (points[0][0] < points[1][0]) {
//         console.log('пошел вправо ')
//         if (points[1][1] < points[2][1]) {
//             console.log('пошел вниз ')
//             console.log('по часовой ')
//         } else {
//             console.log('пошел вверх ')
//             console.log('против часовой ')
//         }

//       } else {
//         console.log('пошел влево ')

//         if (points[1][1] < points[2][1]) {
//             console.log('пошел вниз ')
//             console.log('против часовой ')
//         } else {
//             console.log('пошел вверх ')
//             console.log('по часовой ')
//         }
//       }
// }

// console.log(isClockwise(points1));

// function calcArea(poly) {
//     if(!poly || poly.length < 3) return null;
//     let end = poly.length - 1;
//     let sum = poly[end][0]*poly[0][1] - poly[0][0]*poly[end][1];
//     for(let i=0; i<end; ++i) {
//         const n=i+1;
//         sum += poly[i][0]*poly[n][1] - poly[n][0]*poly[i][1];
//     }
//     return sum;
// }

// function isClockwise(poly) {
//     return calcArea(poly) > 0;
// }


// console.log(isClockwise(points1));

// console.log(isClockwise(points2));


// var allX = []
// var allY = []
// var allSum = []



// points.map((item) => {
//     allX.push(item[0])
//     allY.push(item[1])
//     allSum.push(item[0] + item[1])
// })

// console.log('allX ', allX)
// console.log('allX ', allX.sort())
// console.log('allY ', allY)
// console.log('allY ', allY.sort())


// var Xmin = Math.min.apply(null, allX)
// var Xmax = Math.max.apply(null, allX)
// var Ymin = Math.min.apply(null, allY)
// var Ymax = Math.max.apply(null, allY)

// console.log('Xmin ', Xmin)
// console.log('Xmax ', Xmax)
// console.log('Ymin ', Ymin)
// console.log('Ymax ', Ymax)

// // let topLeft = []
// // let topRight = []
// // let bottomRight = []
// // let bottomLeft = []

// let topLeft = points.filter(item => item[0] === Xmin && item[1] === Ymin )
// let topRight = points.filter(item => item[0] === Xmax && item[1] === Ymin )
// console.log("topLeft ", topLeft)

//////////////////////////

function compareX(a, b) {
    if (a[0] > b[0]) return 1;
    if (b[0] > a[0]) return -1;
    return 0;
}

function compareY(a, b) {
    if (a[1] > b[1]) return 1;
    if (b[1] > a[1]) return -1;
    return 0;
}
  

var activePoints1 = [[230,233],[124,124],[220,680],[306,899]]
var activePoints2 = [[230,233],[124,124],[220,680],[306,899]]
var sortX = activePoints1.sort(compareX)
var sortY = activePoints2.sort(compareY)

console.log("sortX ", sortX)
console.log("sortY ", sortY)

// xxx.find( item=> item)

//////////////////////////

function compareX(a, b) {
    if (a[0] > b[0]) return 1;
    if (b[0] > a[0]) return -1;
    return 0;
}

function compareY(a, b) {
    if (a[1] > b[1]) return 1;
    if (b[1] > a[1]) return -1;
    return 0;
}
  

var activePoints1 = [[230,233],[142,318],[160,944],[306,899]]
var activePoints2 = [[230,233],[142,318],[160,944],[306,899]]
var sortX = activePoints1.sort(compareX)
var sortY = activePoints2.sort(compareY)

console.log("sortX ", sortX)
console.log("sortY ", sortY)


//////////////////////////

function compareX(a, b) {
    if (a[0] > b[0]) return 1;
    if (b[0] > a[0]) return -1;
    return 0;
}
function compareY(a, b) {
    if (a[1] > b[1]) return 1;
    if (b[1] > a[1]) return -1;
    return 0;
}
// var activePoints1 = [[230,233],[142,318],[206,843],[306,899]]
// var activePoints2 = [[230,233],[142,318],[206,843],[306,899]]

var activePoints = [[230,233],[142,318],[160,944],[306,899]]
var activePoints1 = [[230,233],[142,318],[160,944],[306,899]]
var activePoints2 = [[230,233],[142,318],[160,944],[306,899]]

// var activePoints = [[230,233],[124,124],[220,680],[306,899]]
// var activePoints1 = [[230,233],[124,124],[220,680],[306,899]]
// var activePoints2 = [[230,233],[124,124],[220,680],[306,899]]
var sortX = activePoints1.sort(compareX)
var sortY = activePoints2.sort(compareY)

var sorted = {
    p0: [],
    p1: [],
    p2: [],
    p3: []
}
if (sortX[0][0] == sortY[0][0] && sortX[0][1] == sortY[0][1] || sortX[0][0] == sortY[1][0] && sortX[0][1] == sortY[1][1]) {
    sorted.p0 = sortX[0] 
}
if (sortX[3][0] == sortY[3][0] && sortX[3][1] == sortY[3][1] || sortX[3][0] == sortY[2][0] && sortX[3][1] == sortY[2][1]) {
    sorted.p2 = sortX[3] 
}
var index0 = activePoints.findIndex (item => item[0] == sortX[0][0] && item[1] == sortX[0][1])
activePoints.splice(index0,1);
var index3 = activePoints.findIndex (item => item[0] == sortX[3][0] && item[1] == sortX[3][1])
activePoints.splice(index3,1);
activePoints.sort(compareY)
sorted.p1 = activePoints[1]
sorted.p3 = activePoints[0]

console.log("sorted ", sorted)
// console.log("activePoints ", activePoints)