// ==========================================
// BASE DE DATOS LOCAL: BAREMOS WPPSI-IV ( 2:6 a 3:11 años)
// ==========================================

const baremos_WPPSI_1 = {

  escalares: {
    "30-32": { // Edad 2:6 a 2:8 
      "D": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 6, pe: 6 },
        { min: 7, max: 7, pe: 7 }, { min: 8, max: 9, pe: 8 }, { min: 10, max: 10, pe: 9 },
        { min: 11, max: 11, pe: 10 }, { min: 12, max: 13, pe: 11 }, { min: 14, max: 15, pe: 12 },
        { min: 16, max: 16, pe: 13 }, { min: 17, max: 18, pe: 14 }, { min: 19, max: 19, pe: 15 },
        { min: 20, max: 20, pe: 16 }, { min: 21, max: 21, pe: 17 }, { min: 22, max: 22, pe: 18 },
        { min: 23, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 6, pe: 7 }, { min: 7, max: 7, pe: 8 }, { min: 8, max: 8, pe: 9 },
        { min: 9, max: 9, pe: 10 }, { min: 10, max: 10, pe: 11 }, { min: 11, max: 12, pe: 12 },
        { min: 13, max: 13, pe: 13 }, { min: 14, max: 15, pe: 14 }, { min: 16, max: 17, pe: 15 },
        { min: 18, max: 19, pe: 16 }, { min: 20, max: 21, pe: 17 }, { min: 22, max: 22, pe: 18 },
        { min: 23, max: 99, pe: 19 }
      ],
      "R": [ // Nota: No existen escalares 1, 2, 3 para esta prueba en esta edad
        { min: 0, max: 0, pe: 4 }, { min: 1, max: 1, pe: 5 }, { min: 2, max: 2, pe: 6 },
        { min: 3, max: 3, pe: 7 }, { min: 4, max: 5, pe: 8 }, { min: 6, max: 6, pe: 9 },
        { min: 7, max: 8, pe: 10 }, { min: 9, max: 9, pe: 11 }, { min: 10, max: 10, pe: 12 },
        { min: 11, max: 11, pe: 13 }, { min: 12, max: 12, pe: 14 }, { min: 13, max: 13, pe: 15 },
        { min: 14, max: 14, pe: 16 }, { min: 15, max: 15, pe: 17 }, { min: 16, max: 17, pe: 18 },
        { min: 18, max: 99, pe: 19 }
      ],
      "I": [ // Nota: No existe escalar 2
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 3, pe: 4 },
        { min: 4, max: 5, pe: 5 }, { min: 6, max: 6, pe: 6 }, { min: 7, max: 8, pe: 7 },
        { min: 9, max: 9, pe: 8 }, { min: 10, max: 10, pe: 9 }, { min: 11, max: 11, pe: 10 },
        { min: 12, max: 12, pe: 11 }, { min: 13, max: 13, pe: 12 }, { min: 14, max: 14, pe: 13 },
        { min: 15, max: 15, pe: 14 }, { min: 16, max: 16, pe: 15 }, { min: 17, max: 18, pe: 16 },
        { min: 19, max: 19, pe: 17 }, { min: 20, max: 20, pe: 18 }, { min: 21, max: 99, pe: 19 }
      ],
      "RO": [ // Faltan varios escalares iniciales
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 4 }, { min: 2, max: 2, pe: 7 },
        { min: 3, max: 3, pe: 8 }, { min: 4, max: 4, pe: 9 }, { min: 5, max: 6, pe: 10 },
        { min: 7, max: 8, pe: 11 }, { min: 9, max: 9, pe: 12 }, { min: 10, max: 11, pe: 13 },
        { min: 12, max: 14, pe: 14 }, { min: 15, max: 17, pe: 15 }, { min: 18, max: 19, pe: 16 },
        { min: 20, max: 21, pe: 17 }, { min: 22, max: 25, pe: 18 }, { min: 26, max: 99, pe: 19 }
      ],
      "L": [ // Falta el escalar 3, 13, 15, 17
        { min: 0, max: 0, pe: 2 }, { min: 1, max: 1, pe: 4 }, { min: 2, max: 2, pe: 5 },
        { min: 3, max: 3, pe: 6 }, { min: 4, max: 4, pe: 7 }, { min: 5, max: 5, pe: 8 },
        { min: 6, max: 6, pe: 9 }, { min: 7, max: 7, pe: 10 }, { min: 8, max: 8, pe: 11 },
        { min: 9, max: 9, pe: 12 }, { min: 10, max: 10, pe: 14 }, { min: 11, max: 11, pe: 16 },
        { min: 12, max: 12, pe: 18 }, { min: 13, max: 99, pe: 19 }
      ],
      "N": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 6, pe: 7 }, { min: 7, max: 7, pe: 8 }, { min: 8, max: 8, pe: 9 },
        { min: 9, max: 9, pe: 10 }, { min: 10, max: 10, pe: 11 }, { min: 11, max: 11, pe: 12 },
        { min: 12, max: 12, pe: 13 }, { min: 13, max: 13, pe: 14 }, { min: 14, max: 14, pe: 15 },
        { min: 15, max: 15, pe: 16 }, { min: 16, max: 16, pe: 17 }, { min: 17, max: 17, pe: 18 },
        { min: 18, max: 99, pe: 19 }
      ]
    },
    //************************************************************************************************************ */
    "33-35": { // Edad 2:9 a 2:11 
      "D": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 4, pe: 4 }, { min: 5, max: 5, pe: 5 }, { min: 6, max: 7, pe: 6 },
        { min: 8, max: 8, pe: 7 }, { min: 9, max: 10, pe: 8 }, { min: 11, max: 11, pe: 9 },
        { min: 12, max: 13, pe: 10 }, { min: 14, max: 15, pe: 11 }, { min: 16, max: 16, pe: 12 },
        { min: 17, max: 18, pe: 13 }, { min: 19, max: 19, pe: 14 }, { min: 20, max: 20, pe: 15 },
        { min: 21, max: 21, pe: 16 }, { min: 22, max: 22, pe: 17 }, { min: 23, max: 23, pe: 18 },
        { min: 24, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 7, pe: 7 }, { min: 8, max: 8, pe: 8 }, { min: 9, max: 9, pe: 9 },
        { min: 10, max: 10, pe: 10 }, { min: 11, max: 12, pe: 11 }, { min: 13, max: 13, pe: 12 },
        { min: 14, max: 14, pe: 13 }, { min: 15, max: 16, pe: 14 }, { min: 17, max: 18, pe: 15 },
        { min: 19, max: 20, pe: 16 }, { min: 21, max: 21, pe: 17 }, { min: 22, max: 23, pe: 18 },
        { min: 24, max: 99, pe: 19 }
      ],
      "R": [ // Sin escalares 1 y 2
        { min: 0, max: 0, pe: 3 }, { min: 1, max: 1, pe: 4 }, { min: 2, max: 2, pe: 5 },
        { min: 3, max: 3, pe: 6 }, { min: 4, max: 4, pe: 7 }, { min: 5, max: 6, pe: 8 },
        { min: 7, max: 7, pe: 9 }, { min: 8, max: 9, pe: 10 }, { min: 10, max: 10, pe: 11 },
        { min: 11, max: 11, pe: 12 }, { min: 12, max: 12, pe: 13 }, { min: 13, max: 13, pe: 14 },
        { min: 14, max: 14, pe: 15 }, { min: 15, max: 15, pe: 16 }, { min: 16, max: 16, pe: 17 },
        { min: 17, max: 18, pe: 18 }, { min: 19, max: 99, pe: 19 }
      ],
      "I": [ // Sin escalar 2
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 3, pe: 4 },
        { min: 4, max: 6, pe: 5 }, { min: 7, max: 8, pe: 6 }, { min: 9, max: 9, pe: 7 },
        { min: 10, max: 10, pe: 8 }, { min: 11, max: 11, pe: 9 }, { min: 12, max: 12, pe: 10 },
        { min: 13, max: 13, pe: 11 }, { min: 14, max: 14, pe: 12 }, { min: 15, max: 15, pe: 13 },
        { min: 16, max: 17, pe: 14 }, { min: 18, max: 18, pe: 15 }, { min: 19, max: 19, pe: 16 },
        { min: 20, max: 20, pe: 17 }, { min: 21, max: 21, pe: 18 }, { min: 22, max: 99, pe: 19 }
      ],
      "RO": [ // Faltan escalares 2, 3, 5
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 4 }, { min: 2, max: 2, pe: 6 },
        { min: 3, max: 3, pe: 7 }, { min: 4, max: 4, pe: 8 }, { min: 5, max: 5, pe: 9 },
        { min: 6, max: 7, pe: 10 }, { min: 8, max: 9, pe: 11 }, { min: 10, max: 11, pe: 12 },
        { min: 12, max: 13, pe: 13 }, { min: 14, max: 16, pe: 14 }, { min: 17, max: 18, pe: 15 },
        { min: 19, max: 20, pe: 16 }, { min: 21, max: 24, pe: 17 }, { min: 25, max: 28, pe: 18 },
        { min: 29, max: 99, pe: 19 }
      ],
      "L": [ // Faltan escalares 2, 12, 14, 16, 18
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 2, pe: 4 },
        { min: 3, max: 3, pe: 5 }, { min: 4, max: 4, pe: 6 }, { min: 5, max: 5, pe: 7 },
        { min: 6, max: 6, pe: 8 }, { min: 7, max: 7, pe: 9 }, { min: 8, max: 8, pe: 10 },
        { min: 9, max: 9, pe: 11 }, { min: 10, max: 10, pe: 13 }, { min: 11, max: 11, pe: 15 },
        { min: 12, max: 12, pe: 17 }, { min: 13, max: 99, pe: 19 }
      ],
      "N": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 6, pe: 7 }, { min: 7, max: 8, pe: 8 }, { min: 9, max: 9, pe: 9 },
        { min: 10, max: 10, pe: 10 }, { min: 11, max: 11, pe: 11 }, { min: 12, max: 12, pe: 12 },
        { min: 13, max: 13, pe: 13 }, { min: 14, max: 14, pe: 14 }, { min: 15, max: 15, pe: 15 },
        { min: 16, max: 16, pe: 16 }, { min: 17, max: 17, pe: 17 }, { min: 18, max: 18, pe: 18 },
        { min: 19, max: 99, pe: 19 }
      ]
    },
    //**************************************************************************************************************** */
    "36-38": { // Edad 3:0 a 3:2 
      "D": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 3, pe: 3 },
        { min: 4, max: 4, pe: 4 }, { min: 5, max: 6, pe: 5 }, { min: 7, max: 8, pe: 6 },
        { min: 9, max: 10, pe: 7 }, { min: 11, max: 11, pe: 8 }, { min: 12, max: 13, pe: 9 },
        { min: 14, max: 14, pe: 10 }, { min: 15, max: 16, pe: 11 }, { min: 17, max: 18, pe: 12 },
        { min: 19, max: 19, pe: 13 }, { min: 20, max: 20, pe: 14 }, { min: 21, max: 21, pe: 15 },
        { min: 22, max: 22, pe: 16 }, { min: 23, max: 23, pe: 17 }, { min: 24, max: 24, pe: 18 },
        { min: 25, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 5, pe: 5 }, { min: 6, max: 6, pe: 6 },
        { min: 7, max: 7, pe: 7 }, { min: 8, max: 9, pe: 8 }, { min: 10, max: 10, pe: 9 },
        { min: 11, max: 12, pe: 10 }, { min: 13, max: 13, pe: 11 }, { min: 14, max: 14, pe: 12 },
        { min: 15, max: 16, pe: 13 }, { min: 17, max: 18, pe: 14 }, { min: 19, max: 19, pe: 15 },
        { min: 20, max: 21, pe: 16 }, { min: 22, max: 22, pe: 17 }, { min: 23, max: 24, pe: 18 },
        { min: 25, max: 99, pe: 19 }
      ],
      "R": [ // Sin escalar 1
        { min: 0, max: 0, pe: 2 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 2, pe: 4 },
        { min: 3, max: 3, pe: 5 }, { min: 4, max: 4, pe: 6 }, { min: 5, max: 6, pe: 7 },
        { min: 7, max: 7, pe: 8 }, { min: 8, max: 9, pe: 9 }, { min: 10, max: 10, pe: 10 },
        { min: 11, max: 11, pe: 11 }, { min: 12, max: 12, pe: 12 }, { min: 13, max: 13, pe: 13 },
        { min: 14, max: 14, pe: 14 }, { min: 15, max: 15, pe: 15 }, { min: 16, max: 16, pe: 16 },
        { min: 17, max: 18, pe: 17 }, { min: 19, max: 20, pe: 18 }, { min: 21, max: 99, pe: 19 }
      ],
      "I": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 3, pe: 3 },
        { min: 4, max: 6, pe: 4 }, { min: 7, max: 8, pe: 5 }, { min: 9, max: 9, pe: 6 },
        { min: 10, max: 10, pe: 7 }, { min: 11, max: 11, pe: 8 }, { min: 12, max: 12, pe: 9 },
        { min: 13, max: 14, pe: 10 }, { min: 15, max: 15, pe: 11 }, { min: 16, max: 16, pe: 12 },
        { min: 17, max: 17, pe: 13 }, { min: 18, max: 18, pe: 14 }, { min: 19, max: 19, pe: 15 },
        { min: 20, max: 20, pe: 16 }, { min: 21, max: 21, pe: 17 }, { min: 22, max: 22, pe: 18 },
        { min: 23, max: 99, pe: 19 }
      ],
      "RO": [ // Faltan escalares 2, 3, 5
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 4 }, { min: 2, max: 2, pe: 6 },
        { min: 3, max: 3, pe: 7 }, { min: 4, max: 5, pe: 8 }, { min: 6, max: 6, pe: 9 },
        { min: 7, max: 9, pe: 10 }, { min: 10, max: 11, pe: 11 }, { min: 12, max: 13, pe: 12 },
        { min: 14, max: 16, pe: 13 }, { min: 17, max: 19, pe: 14 }, { min: 20, max: 21, pe: 15 },
        { min: 22, max: 24, pe: 16 }, { min: 25, max: 27, pe: 17 }, { min: 28, max: 29, pe: 18 },
        { min: 30, max: 99, pe: 19 }
      ],
      "L": [ // Faltan escalares 2, 9, 13, 15, 17
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 2, pe: 4 },
        { min: 3, max: 3, pe: 5 }, { min: 4, max: 4, pe: 6 }, { min: 5, max: 6, pe: 7 },
        { min: 7, max: 7, pe: 8 }, { min: 8, max: 8, pe: 10 }, { min: 9, max: 9, pe: 11 },
        { min: 10, max: 10, pe: 12 }, { min: 11, max: 11, pe: 14 }, { min: 12, max: 12, pe: 16 },
        { min: 13, max: 13, pe: 18 }, { min: 14, max: 99, pe: 19 }
      ],
      "N": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 3, pe: 3 },
        { min: 4, max: 4, pe: 4 }, { min: 5, max: 5, pe: 5 }, { min: 6, max: 6, pe: 6 },
        { min: 7, max: 7, pe: 7 }, { min: 8, max: 8, pe: 8 }, { min: 9, max: 9, pe: 9 },
        { min: 10, max: 11, pe: 10 }, { min: 12, max: 12, pe: 11 }, { min: 13, max: 13, pe: 12 },
        { min: 14, max: 14, pe: 13 }, { min: 15, max: 15, pe: 14 }, { min: 16, max: 16, pe: 15 },
        { min: 17, max: 17, pe: 16 }, { min: 18, max: 18, pe: 17 }, { min: 19, max: 19, pe: 18 },
        { min: 20, max: 99, pe: 19 }
      ]
    },

    //********************************************************************************************************* */
    "39-41": { // Edad 3:3 a 3:5 
      "D": [
        { min: 0, max: 2, pe: 1 }, { min: 3, max: 3, pe: 2 }, { min: 4, max: 4, pe: 3 },
        { min: 5, max: 5, pe: 4 }, { min: 6, max: 7, pe: 5 }, { min: 8, max: 9, pe: 6 },
        { min: 10, max: 11, pe: 7 }, { min: 12, max: 12, pe: 8 }, { min: 13, max: 14, pe: 9 },
        { min: 15, max: 16, pe: 10 }, { min: 17, max: 18, pe: 11 }, { min: 19, max: 19, pe: 12 },
        { min: 20, max: 20, pe: 13 }, { min: 21, max: 21, pe: 14 }, { min: 22, max: 22, pe: 15 },
        { min: 23, max: 23, pe: 16 }, { min: 24, max: 24, pe: 17 }, { min: 25, max: 25, pe: 18 },
        { min: 26, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 3, pe: 3 },
        { min: 4, max: 4, pe: 4 }, { min: 5, max: 6, pe: 5 }, { min: 7, max: 7, pe: 6 },
        { min: 8, max: 9, pe: 7 }, { min: 10, max: 10, pe: 8 }, { min: 11, max: 12, pe: 9 },
        { min: 13, max: 13, pe: 10 }, { min: 14, max: 14, pe: 11 }, { min: 15, max: 16, pe: 12 },
        { min: 17, max: 18, pe: 13 }, { min: 19, max: 19, pe: 14 }, { min: 20, max: 20, pe: 15 },
        { min: 21, max: 22, pe: 16 }, { min: 23, max: 23, pe: 17 }, { min: 24, max: 25, pe: 18 },
        { min: 26, max: 99, pe: 19 }
      ],
      "R": [
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 7, pe: 7 }, { min: 8, max: 8, pe: 8 }, { min: 9, max: 10, pe: 9 },
        { min: 11, max: 11, pe: 10 }, { min: 12, max: 12, pe: 11 }, { min: 13, max: 13, pe: 12 },
        { min: 14, max: 14, pe: 13 }, { min: 15, max: 15, pe: 14 }, { min: 16, max: 16, pe: 15 },
        { min: 17, max: 17, pe: 16 }, { min: 18, max: 19, pe: 17 }, { min: 20, max: 21, pe: 18 },
        { min: 22, max: 99, pe: 19 }
      ],
      "I": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 3, pe: 2 }, { min: 4, max: 4, pe: 3 },
        { min: 5, max: 7, pe: 4 }, { min: 8, max: 9, pe: 5 }, { min: 10, max: 10, pe: 6 },
        { min: 11, max: 11, pe: 7 }, { min: 12, max: 12, pe: 8 }, { min: 13, max: 13, pe: 9 },
        { min: 14, max: 14, pe: 10 }, { min: 15, max: 15, pe: 11 }, { min: 16, max: 16, pe: 12 },
        { min: 17, max: 17, pe: 13 }, { min: 18, max: 18, pe: 14 }, { min: 19, max: 19, pe: 15 },
        { min: 20, max: 20, pe: 16 }, { min: 21, max: 21, pe: 17 }, { min: 22, max: 22, pe: 18 },
        { min: 23, max: 99, pe: 19 }
      ],
      "RO": [ // Faltan escalares 2 y 4
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 2, pe: 5 },
        { min: 3, max: 3, pe: 6 }, { min: 4, max: 4, pe: 7 }, { min: 5, max: 6, pe: 8 },
        { min: 7, max: 8, pe: 9 }, { min: 9, max: 11, pe: 10 }, { min: 12, max: 13, pe: 11 },
        { min: 14, max: 16, pe: 12 }, { min: 17, max: 19, pe: 13 }, { min: 20, max: 21, pe: 14 },
        { min: 22, max: 24, pe: 15 }, { min: 25, max: 27, pe: 16 }, { min: 28, max: 29, pe: 17 },
        { min: 30, max: 31, pe: 18 }, { min: 32, max: 99, pe: 19 }
      ],
      "L": [ // Faltan escalares 12, 14, 16, 18
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 6, pe: 7 }, { min: 7, max: 7, pe: 8 }, { min: 8, max: 8, pe: 9 },
        { min: 9, max: 9, pe: 10 }, { min: 10, max: 10, pe: 11 }, { min: 11, max: 11, pe: 13 },
        { min: 12, max: 12, pe: 15 }, { min: 13, max: 13, pe: 17 }, { min: 14, max: 99, pe: 19 }
      ],
      "N": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 3, pe: 3 },
        { min: 4, max: 4, pe: 4 }, { min: 5, max: 6, pe: 5 }, { min: 7, max: 7, pe: 6 },
        { min: 8, max: 8, pe: 7 }, { min: 9, max: 9, pe: 8 }, { min: 10, max: 11, pe: 9 },
        { min: 12, max: 12, pe: 10 }, { min: 13, max: 13, pe: 11 }, { min: 14, max: 14, pe: 12 },
        { min: 15, max: 15, pe: 13 }, { min: 16, max: 16, pe: 14 }, { min: 17, max: 17, pe: 15 },
        { min: 18, max: 18, pe: 16 }, { min: 19, max: 19, pe: 17 }, { min: 20, max: 20, pe: 18 },
        { min: 21, max: 99, pe: 19 }
      ]
    },
    //********************************************************************************************************** */
    "42-44": { // Edad 3:6 a 3:8 
      "D": [
        { min: 0, max: 2, pe: 1 }, { min: 3, max: 3, pe: 2 }, { min: 4, max: 5, pe: 3 },
        { min: 6, max: 6, pe: 4 }, { min: 7, max: 8, pe: 5 }, { min: 9, max: 9, pe: 6 },
        { min: 10, max: 11, pe: 7 }, { min: 12, max: 13, pe: 8 }, { min: 14, max: 15, pe: 9 },
        { min: 16, max: 17, pe: 10 }, { min: 18, max: 19, pe: 11 }, { min: 20, max: 20, pe: 12 },
        { min: 21, max: 21, pe: 13 }, { min: 22, max: 22, pe: 14 }, { min: 23, max: 23, pe: 15 },
        { min: 24, max: 24, pe: 16 }, { min: 25, max: 25, pe: 17 }, { min: 26, max: 26, pe: 18 },
        { min: 27, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 4, pe: 3 },
        { min: 5, max: 6, pe: 4 }, { min: 7, max: 7, pe: 5 }, { min: 8, max: 9, pe: 6 },
        { min: 10, max: 10, pe: 7 }, { min: 11, max: 12, pe: 8 }, { min: 13, max: 13, pe: 9 },
        { min: 14, max: 14, pe: 10 }, { min: 15, max: 16, pe: 11 }, { min: 17, max: 18, pe: 12 },
        { min: 19, max: 19, pe: 13 }, { min: 20, max: 20, pe: 14 }, { min: 21, max: 21, pe: 15 },
        { min: 22, max: 23, pe: 16 }, { min: 24, max: 24, pe: 17 }, { min: 25, max: 26, pe: 18 },
        { min: 27, max: 99, pe: 19 }
      ],
      "R": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 2, pe: 2 }, { min: 3, max: 3, pe: 3 },
        { min: 4, max: 4, pe: 4 }, { min: 5, max: 5, pe: 5 }, { min: 6, max: 6, pe: 6 },
        { min: 7, max: 7, pe: 7 }, { min: 8, max: 9, pe: 8 }, { min: 10, max: 11, pe: 9 },
        { min: 12, max: 12, pe: 10 }, { min: 13, max: 13, pe: 11 }, { min: 14, max: 14, pe: 12 },
        { min: 15, max: 15, pe: 13 }, { min: 16, max: 16, pe: 14 }, { min: 17, max: 17, pe: 15 },
        { min: 18, max: 18, pe: 16 }, { min: 19, max: 20, pe: 17 }, { min: 21, max: 21, pe: 18 },
        { min: 22, max: 99, pe: 19 }
      ],
      "I": [
        { min: 0, max: 3, pe: 1 }, { min: 4, max: 5, pe: 2 }, { min: 6, max: 6, pe: 3 },
        { min: 7, max: 9, pe: 4 }, { min: 10, max: 10, pe: 5 }, { min: 11, max: 11, pe: 6 },
        { min: 12, max: 12, pe: 7 }, { min: 13, max: 13, pe: 8 }, { min: 14, max: 14, pe: 9 },
        { min: 15, max: 15, pe: 10 }, { min: 16, max: 16, pe: 11 }, { min: 17, max: 17, pe: 12 },
        { min: 18, max: 18, pe: 13 }, { min: 19, max: 19, pe: 14 }, { min: 20, max: 20, pe: 15 },
        { min: 21, max: 21, pe: 16 }, { min: 22, max: 22, pe: 17 }, { min: 23, max: 23, pe: 18 },
        { min: 24, max: 99, pe: 19 }
      ],
      "RO": [ // Falta escalar 2
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 2, pe: 4 },
        { min: 3, max: 3, pe: 5 }, { min: 4, max: 5, pe: 6 }, { min: 6, max: 6, pe: 7 },
        { min: 7, max: 9, pe: 8 }, { min: 10, max: 11, pe: 9 }, { min: 12, max: 14, pe: 10 },
        { min: 15, max: 16, pe: 11 }, { min: 17, max: 19, pe: 12 }, { min: 20, max: 21, pe: 13 },
        { min: 22, max: 24, pe: 14 }, { min: 25, max: 27, pe: 15 }, { min: 28, max: 29, pe: 16 },
        { min: 30, max: 31, pe: 17 }, { min: 32, max: 33, pe: 18 }, { min: 34, max: 99, pe: 19 }
      ],
      "L": [ // Faltan escalares 12, 14, 16, 18
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 4, pe: 5 }, { min: 5, max: 5, pe: 6 },
        { min: 6, max: 6, pe: 7 }, { min: 7, max: 7, pe: 8 }, { min: 8, max: 8, pe: 9 },
        { min: 9, max: 9, pe: 10 }, { min: 10, max: 10, pe: 11 }, { min: 11, max: 11, pe: 13 },
        { min: 12, max: 12, pe: 15 }, { min: 13, max: 13, pe: 17 }, { min: 14, max: 99, pe: 19 }
      ],
      "N": [
        { min: 0, max: 2, pe: 1 }, { min: 3, max: 3, pe: 2 }, { min: 4, max: 4, pe: 3 },
        { min: 5, max: 5, pe: 4 }, { min: 6, max: 6, pe: 5 }, { min: 7, max: 7, pe: 6 },
        { min: 8, max: 9, pe: 7 }, { min: 10, max: 10, pe: 8 }, { min: 11, max: 11, pe: 9 },
        { min: 12, max: 13, pe: 10 }, { min: 14, max: 14, pe: 11 }, { min: 15, max: 15, pe: 12 },
        { min: 16, max: 16, pe: 13 }, { min: 17, max: 17, pe: 14 }, { min: 18, max: 18, pe: 15 },
        { min: 19, max: 19, pe: 16 }, { min: 20, max: 20, pe: 17 }, { min: 21, max: 21, pe: 18 },
        { min: 22, max: 99, pe: 19 }
      ]
    },

    "45-47": { // Edad 3:9 a 3:11 ("45-47")
      "D": [
        { min: 0, max: 3, pe: 1 }, { min: 4, max: 4, pe: 2 }, { min: 5, max: 5, pe: 3 },
        { min: 6, max: 7, pe: 4 }, { min: 8, max: 9, pe: 5 }, { min: 10, max: 11, pe: 6 },
        { min: 12, max: 13, pe: 7 }, { min: 14, max: 15, pe: 8 }, { min: 16, max: 17, pe: 9 },
        { min: 18, max: 18, pe: 10 }, { min: 19, max: 20, pe: 11 }, { min: 21, max: 21, pe: 12 },
        { min: 22, max: 22, pe: 13 }, { min: 23, max: 23, pe: 14 }, { min: 24, max: 24, pe: 15 },
        { min: 25, max: 25, pe: 16 }, { min: 26, max: 26, pe: 17 },
        // No hay escalar 18 para D en esta edad
        { min: 27, max: 99, pe: 19 }
      ],
      "C": [
        { min: 0, max: 2, pe: 1 }, { min: 3, max: 3, pe: 2 }, { min: 4, max: 5, pe: 3 },
        { min: 6, max: 7, pe: 4 }, { min: 8, max: 9, pe: 5 }, { min: 10, max: 10, pe: 6 },
        { min: 11, max: 12, pe: 7 }, { min: 13, max: 13, pe: 8 }, { min: 14, max: 14, pe: 9 },
        { min: 15, max: 16, pe: 10 }, { min: 17, max: 18, pe: 11 }, { min: 19, max: 19, pe: 12 },
        { min: 20, max: 20, pe: 13 }, { min: 21, max: 21, pe: 14 }, { min: 22, max: 22, pe: 15 },
        { min: 23, max: 24, pe: 16 }, { min: 25, max: 25, pe: 17 }, { min: 26, max: 27, pe: 18 },
        { min: 28, max: 99, pe: 19 }
      ],
      "R": [
        { min: 0, max: 1, pe: 1 }, { min: 2, max: 3, pe: 2 }, { min: 4, max: 4, pe: 3 },
        { min: 5, max: 5, pe: 4 }, { min: 6, max: 6, pe: 5 }, { min: 7, max: 7, pe: 6 },
        { min: 8, max: 9, pe: 7 }, { min: 10, max: 10, pe: 8 }, { min: 11, max: 11, pe: 9 },
        { min: 12, max: 13, pe: 10 }, { min: 14, max: 14, pe: 11 }, { min: 15, max: 15, pe: 12 },
        { min: 16, max: 16, pe: 13 }, { min: 17, max: 17, pe: 14 }, { min: 18, max: 18, pe: 15 },
        { min: 19, max: 19, pe: 16 }, { min: 20, max: 20, pe: 17 }, { min: 21, max: 22, pe: 18 },
        { min: 23, max: 99, pe: 19 }
      ],
      "I": [
        { min: 0, max: 5, pe: 1 }, { min: 6, max: 6, pe: 2 }, { min: 7, max: 8, pe: 3 },
        { min: 9, max: 10, pe: 4 }, { min: 11, max: 11, pe: 5 }, { min: 12, max: 12, pe: 6 },
        { min: 13, max: 13, pe: 7 }, { min: 14, max: 14, pe: 8 }, { min: 15, max: 15, pe: 9 },
        { min: 16, max: 16, pe: 10 }, { min: 17, max: 17, pe: 11 }, { min: 18, max: 18, pe: 12 },
        { min: 19, max: 19, pe: 13 }, { min: 20, max: 20, pe: 14 }, { min: 21, max: 21, pe: 15 },
        { min: 22, max: 22, pe: 16 }, { min: 23, max: 23, pe: 17 }, { min: 24, max: 24, pe: 18 },
        { min: 25, max: 99, pe: 19 }
      ],
      "RO": [ // Falta escalar 2
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 3 }, { min: 2, max: 3, pe: 4 },
        { min: 4, max: 4, pe: 5 }, { min: 5, max: 6, pe: 6 }, { min: 7, max: 8, pe: 7 },
        { min: 9, max: 11, pe: 8 }, { min: 12, max: 13, pe: 9 }, { min: 14, max: 16, pe: 10 },
        { min: 17, max: 19, pe: 11 }, { min: 20, max: 22, pe: 12 }, { min: 23, max: 24, pe: 13 },
        { min: 25, max: 27, pe: 14 }, { min: 28, max: 29, pe: 15 }, { min: 30, max: 31, pe: 16 },
        { min: 32, max: 33, pe: 17 }, { min: 34, max: 35, pe: 18 }, { min: 36, max: 99, pe: 19 }
      ],
      "L": [ // Faltan escalares 10, 13, 15, 17
        { min: 0, max: 0, pe: 1 }, { min: 1, max: 1, pe: 2 }, { min: 2, max: 2, pe: 3 },
        { min: 3, max: 3, pe: 4 }, { min: 4, max: 5, pe: 5 }, { min: 6, max: 6, pe: 6 },
        { min: 7, max: 7, pe: 7 }, { min: 8, max: 8, pe: 8 }, { min: 9, max: 9, pe: 9 },
        { min: 10, max: 10, pe: 11 }, { min: 11, max: 11, pe: 12 }, { min: 12, max: 12, pe: 14 },
        { min: 13, max: 13, pe: 16 }, { min: 14, max: 14, pe: 18 }, { min: 15, max: 99, pe: 19 }
      ],
      "N": [ // Falta escalar 14
        { min: 0, max: 2, pe: 1 }, { min: 3, max: 3, pe: 2 }, { min: 4, max: 4, pe: 3 },
        { min: 5, max: 5, pe: 4 }, { min: 6, max: 7, pe: 5 }, { min: 8, max: 8, pe: 6 },
        { min: 9, max: 10, pe: 7 }, { min: 11, max: 11, pe: 8 }, { min: 12, max: 12, pe: 9 },
        { min: 13, max: 14, pe: 10 }, { min: 15, max: 15, pe: 11 }, { min: 16, max: 16, pe: 12 },
        { min: 17, max: 17, pe: 13 }, { min: 18, max: 18, pe: 15 }, { min: 19, max: 19, pe: 16 },
        { min: 20, max: 20, pe: 17 }, { min: 21, max: 21, pe: 18 }, { min: 22, max: 99, pe: 19 }
      ]
    }

  },






  // ==========================================
  // 2. ÍNDICES COMPUESTOS (GLOBALES PARA ETAPA 1)
  // CORRECCIÓN: Sólo intervalos de confianza al 95% (Rango más amplio)
  // ==========================================
  indices: {
    "ICV": [
      { suma: 2, ci: 45, percentil: "<0.1", ic95: "42-60" }, { suma: 3, ci: 50, percentil: "<0.1", ic95: "47-64" },
      { suma: 4, ci: 53, percentil: "0.1", ic95: "49-67" }, { suma: 5, ci: 56, percentil: "0.2", ic95: "52-70" },
      { suma: 6, ci: 59, percentil: "0.3", ic95: "55-72" }, { suma: 7, ci: 62, percentil: "1", ic95: "58-75" },
      { suma: 8, ci: 65, percentil: "1", ic95: "60-78" }, { suma: 9, ci: 68, percentil: "2", ic95: "63-80" },
      { suma: 10, ci: 71, percentil: "3", ic95: "66-83" }, { suma: 11, ci: 74, percentil: "4", ic95: "68-86" },
      { suma: 12, ci: 77, percentil: "6", ic95: "71-88" }, { suma: 13, ci: 79, percentil: "8", ic95: "73-90" },
      { suma: 14, ci: 82, percentil: "12", ic95: "75-93" }, { suma: 15, ci: 85, percentil: "16", ic95: "78-95" },
      { suma: 16, ci: 88, percentil: "21", ic95: "81-98" }, { suma: 17, ci: 91, percentil: "27", ic95: "83-101" },
      { suma: 18, ci: 93, percentil: "32", ic95: "85-102" }, { suma: 19, ci: 97, percentil: "42", ic95: "89-106" },
      { suma: 20, ci: 100, percentil: "50", ic95: "91-109" }, { suma: 21, ci: 103, percentil: "58", ic95: "94-111" },
      { suma: 22, ci: 106, percentil: "66", ic95: "97-114" }, { suma: 23, ci: 108, percentil: "70", ic95: "98-116" },
      { suma: 24, ci: 112, percentil: "79", ic95: "102-119" }, { suma: 25, ci: 115, percentil: "84", ic95: "105-122" },
      { suma: 26, ci: 118, percentil: "88", ic95: "107-125" }, { suma: 27, ci: 120, percentil: "91", ic95: "109-126" },
      { suma: 28, ci: 122, percentil: "93", ic95: "111-128" }, { suma: 29, ci: 125, percentil: "95", ic95: "114-131" },
      { suma: 30, ci: 128, percentil: "97", ic95: "116-134" }, { suma: 31, ci: 131, percentil: "98", ic95: "119-136" },
      { suma: 32, ci: 135, percentil: "99", ic95: "122-140" }, { suma: 33, ci: 138, percentil: "99", ic95: "125-142" },
      { suma: 34, ci: 141, percentil: "99.7", ic95: "128-145" }, { suma: 35, ci: 144, percentil: "99.8", ic95: "130-148" },
      { suma: 36, ci: 147, percentil: "99.9", ic95: "133-151" }, { suma: 37, ci: 151, percentil: ">99.9", ic95: "137-154" },
      { suma: 38, ci: 155, percentil: ">99.9", ic95: "140-158" }
    ],
    "IVE": [
      { suma: 2, ci: 45, percentil: "<0.1", ic95: "44-63" }, { suma: 3, ci: 49, percentil: "<0.1", ic95: "47-66" },
      { suma: 4, ci: 53, percentil: "0.1", ic95: "50-70" }, { suma: 5, ci: 56, percentil: "0.2", ic95: "53-72" },
      { suma: 6, ci: 59, percentil: "0.3", ic95: "55-75" }, { suma: 7, ci: 62, percentil: "1", ic95: "58-77" },
      { suma: 8, ci: 65, percentil: "1", ic95: "61-80" }, { suma: 9, ci: 68, percentil: "2", ic95: "63-82" },
      { suma: 10, ci: 71, percentil: "3", ic95: "66-85" }, { suma: 11, ci: 74, percentil: "4", ic95: "68-88" },
      { suma: 12, ci: 76, percentil: "5", ic95: "70-89" }, { suma: 13, ci: 79, percentil: "8", ic95: "72-92" },
      { suma: 14, ci: 82, percentil: "12", ic95: "75-94" }, { suma: 15, ci: 85, percentil: "16", ic95: "78-97" },
      { suma: 16, ci: 88, percentil: "21", ic95: "80-99" }, { suma: 17, ci: 91, percentil: "27", ic95: "83-102" },
      { suma: 18, ci: 94, percentil: "34", ic95: "85-105" }, { suma: 19, ci: 97, percentil: "42", ic95: "88-107" },
      { suma: 20, ci: 100, percentil: "50", ic95: "90-110" }, { suma: 21, ci: 103, percentil: "58", ic95: "93-112" },
      { suma: 22, ci: 106, percentil: "66", ic95: "95-115" }, { suma: 23, ci: 109, percentil: "73", ic95: "98-117" },
      { suma: 24, ci: 112, percentil: "79", ic95: "101-120" }, { suma: 25, ci: 115, percentil: "84", ic95: "103-122" },
      { suma: 26, ci: 117, percentil: "87", ic95: "105-124" }, { suma: 27, ci: 120, percentil: "91", ic95: "107-127" },
      { suma: 28, ci: 124, percentil: "95", ic95: "111-130" }, { suma: 29, ci: 127, percentil: "96", ic95: "113-133" },
      { suma: 30, ci: 130, percentil: "98", ic95: "116-135" }, { suma: 31, ci: 133, percentil: "99", ic95: "118-138" },
      { suma: 32, ci: 137, percentil: "99", ic95: "122-141" }, { suma: 33, ci: 140, percentil: "99.6", ic95: "124-144" },
      { suma: 34, ci: 143, percentil: "99.8", ic95: "127-146" }, { suma: 35, ci: 146, percentil: "99.9", ic95: "129-149" },
      { suma: 36, ci: 149, percentil: "99.9", ic95: "132-151" }, { suma: 37, ci: 152, percentil: ">99.9", ic95: "135-154" },
      { suma: 38, ci: 155, percentil: ">99.9", ic95: "137-156" }
    ],
    "IMT": [
      { suma: 2, ci: 45, percentil: "<0.1", ic95: "43-61" }, { suma: 3, ci: 49, percentil: "<0.1", ic95: "46-65" },
      { suma: 4, ci: 52, percentil: "0.1", ic95: "49-67" }, { suma: 5, ci: 55, percentil: "0.1", ic95: "52-70" },
      { suma: 6, ci: 58, percentil: "0.3", ic95: "54-73" }, { suma: 7, ci: 61, percentil: "0.5", ic95: "57-75" },
      { suma: 8, ci: 64, percentil: "1", ic95: "59-78" }, { suma: 9, ci: 67, percentil: "1", ic95: "62-81" },
      { suma: 10, ci: 70, percentil: "2", ic95: "65-83" }, { suma: 11, ci: 73, percentil: "4", ic95: "67-86" },
      { suma: 12, ci: 76, percentil: "5", ic95: "70-88" }, { suma: 13, ci: 78, percentil: "7", ic95: "72-90" },
      { suma: 14, ci: 81, percentil: "10", ic95: "74-93" }, { suma: 15, ci: 84, percentil: "14", ic95: "77-95" },
      { suma: 16, ci: 87, percentil: "19", ic95: "79-98" }, { suma: 17, ci: 91, percentil: "27", ic95: "83-101" },
      { suma: 18, ci: 93, percentil: "32", ic95: "85-103" }, { suma: 19, ci: 97, percentil: "42", ic95: "88-107" },
      { suma: 20, ci: 100, percentil: "50", ic95: "91-109" }, { suma: 21, ci: 103, percentil: "58", ic95: "93-112" },
      { suma: 22, ci: 106, percentil: "66", ic95: "96-114" }, { suma: 23, ci: 110, percentil: "75", ic95: "99-118" },
      { suma: 24, ci: 112, percentil: "79", ic95: "101-120" }, { suma: 25, ci: 115, percentil: "84", ic95: "104-122" },
      { suma: 26, ci: 118, percentil: "88", ic95: "106-125" }, { suma: 27, ci: 121, percentil: "92", ic95: "109-127" },
      { suma: 28, ci: 123, percentil: "94", ic95: "111-129" }, { suma: 29, ci: 126, percentil: "96", ic95: "113-132" },
      { suma: 30, ci: 128, percentil: "97", ic95: "115-134" }, { suma: 31, ci: 131, percentil: "98", ic95: "118-136" },
      { suma: 32, ci: 135, percentil: "99", ic95: "121-140" }, { suma: 33, ci: 138, percentil: "99", ic95: "124-142" },
      { suma: 34, ci: 141, percentil: "99.7", ic95: "126-145" }, { suma: 35, ci: 144, percentil: "99.8", ic95: "129-148" },
      { suma: 36, ci: 147, percentil: "99.9", ic95: "132-150" }, { suma: 37, ci: 151, percentil: ">99.9", ic95: "135-154" },
      { suma: 38, ci: 155, percentil: ">99.9", ic95: "139-157" }
    ],
    "CIT": [
      { suma: 5, ci: 40, percentil: "<0.1", ic95: "37-51" },
      { suma: 6, ci: 42, percentil: "<0.1", ic95: "39-53" }, { suma: 7, ci: 43, percentil: "<0.1", ic95: "40-54" },
      { suma: 8, ci: 45, percentil: "<0.1", ic95: "42-56" }, { suma: 9, ci: 46, percentil: "<0.1", ic95: "43-57" },
      { suma: 10, ci: 48, percentil: "<0.1", ic95: "44-59" }, { suma: 11, ci: 49, percentil: "<0.1", ic95: "45-60" },
      { suma: 12, ci: 51, percentil: "0.1", ic95: "47-62" }, { suma: 13, ci: 52, percentil: "0.1", ic95: "48-63" },
      { suma: 14, ci: 53, percentil: "0.1", ic95: "49-64" }, { suma: 15, ci: 54, percentil: "0.1", ic95: "50-64" },
      { suma: 16, ci: 56, percentil: "0.2", ic95: "52-66" }, { suma: 17, ci: 57, percentil: "0.2", ic95: "53-67" },
      { suma: 18, ci: 58, percentil: "0.3", ic95: "54-68" }, { suma: 19, ci: 59, percentil: "0.3", ic95: "55-69" },
      { suma: 20, ci: 61, percentil: "0.5", ic95: "56-71" }, { suma: 21, ci: 62, percentil: "1", ic95: "57-72" },
      { suma: 22, ci: 63, percentil: "1", ic95: "58-73" }, { suma: 23, ci: 64, percentil: "1", ic95: "59-74" },
      { suma: 24, ci: 65, percentil: "1", ic95: "60-75" }, { suma: 25, ci: 66, percentil: "1", ic95: "61-76" },
      { suma: 26, ci: 68, percentil: "2", ic95: "63-77" }, { suma: 27, ci: 69, percentil: "2", ic95: "64-78" },
      { suma: 28, ci: 70, percentil: "2", ic95: "65-79" }, { suma: 29, ci: 71, percentil: "3", ic95: "66-80" },
      { suma: 30, ci: 72, percentil: "3", ic95: "67-81" }, { suma: 31, ci: 73, percentil: "4", ic95: "68-82" },
      { suma: 32, ci: 74, percentil: "4", ic95: "69-83" }, { suma: 33, ci: 75, percentil: "5", ic95: "70-84" },
      { suma: 34, ci: 76, percentil: "5", ic95: "70-85" }, { suma: 35, ci: 78, percentil: "7", ic95: "72-87" },
      { suma: 36, ci: 79, percentil: "8", ic95: "73-88" }, { suma: 37, ci: 80, percentil: "9", ic95: "74-89" },
      { suma: 38, ci: 82, percentil: "12", ic95: "76-90" }, { suma: 39, ci: 83, percentil: "13", ic95: "77-91" },
      { suma: 40, ci: 85, percentil: "16", ic95: "79-93" }, { suma: 41, ci: 86, percentil: "18", ic95: "80-94" },
      { suma: 42, ci: 87, percentil: "19", ic95: "81-95" }, { suma: 43, ci: 89, percentil: "23", ic95: "83-97" },
      { suma: 44, ci: 90, percentil: "25", ic95: "83-98" }, { suma: 45, ci: 92, percentil: "30", ic95: "85-100" },
      { suma: 46, ci: 94, percentil: "34", ic95: "87-102" }, { suma: 47, ci: 95, percentil: "37", ic95: "89-103" },
      { suma: 48, ci: 97, percentil: "42", ic95: "90-104" }, { suma: 49, ci: 98, percentil: "45", ic95: "91-105" },
      { suma: 50, ci: 100, percentil: "50", ic95: "93-107" }, { suma: 51, ci: 102, percentil: "55", ic95: "95-109" },
      { suma: 52, ci: 103, percentil: "58", ic95: "96-110" }, { suma: 53, ci: 104, percentil: "61", ic95: "96-111" },
      { suma: 54, ci: 106, percentil: "66", ic95: "98-113" }, { suma: 55, ci: 107, percentil: "68", ic95: "99-114" },
      { suma: 56, ci: 109, percentil: "73", ic95: "101-116" }, { suma: 57, ci: 110, percentil: "75", ic95: "102-117" },
      { suma: 58, ci: 112, percentil: "79", ic95: "104-118" }, { suma: 59, ci: 113, percentil: "81", ic95: "105-119" },
      { suma: 60, ci: 115, percentil: "84", ic95: "107-121" }, { suma: 61, ci: 117, percentil: "87", ic95: "109-123" },
      { suma: 62, ci: 118, percentil: "88", ic95: "110-124" }, { suma: 63, ci: 120, percentil: "91", ic95: "111-125" },
      { suma: 64, ci: 121, percentil: "92", ic95: "112-127" }, { suma: 65, ci: 122, percentil: "93", ic95: "113-128" },
      { suma: 66, ci: 123, percentil: "94", ic95: "114-129" }, { suma: 67, ci: 124, percentil: "95", ic95: "115-130" },
      { suma: 68, ci: 126, percentil: "96", ic95: "117-131" }, { suma: 69, ci: 127, percentil: "96", ic95: "118-132" },
      { suma: 70, ci: 129, percentil: "97", ic95: "120-134" }, { suma: 71, ci: 130, percentil: "98", ic95: "121-135" },
      { suma: 72, ci: 131, percentil: "98", ic95: "122-136" }, { suma: 73, ci: 132, percentil: "98", ic95: "123-137" },
      { suma: 74, ci: 133, percentil: "99", ic95: "123-138" }, { suma: 75, ci: 134, percentil: "99", ic95: "124-139" },
      { suma: 76, ci: 135, percentil: "99", ic95: "125-140" }, { suma: 77, ci: 137, percentil: "99", ic95: "127-142" },
      { suma: 78, ci: 138, percentil: "99", ic95: "128-143" }, { suma: 79, ci: 140, percentil: "99.6", ic95: "130-144" },
      { suma: 80, ci: 141, percentil: "99.7", ic95: "131-145" }, { suma: 81, ci: 143, percentil: "99.8", ic95: "133-147" },
      { suma: 82, ci: 144, percentil: "99.8", ic95: "134-148" }, { suma: 83, ci: 145, percentil: "99.9", ic95: "135-149" },
      { suma: 84, ci: 146, percentil: "99.9", ic95: "136-150" }, { suma: 85, ci: 147, percentil: "99.9", ic95: "136-151" },
      { suma: 86, ci: 149, percentil: "99.9", ic95: "138-152" }, { suma: 87, ci: 150, percentil: ">99.9", ic95: "139-154" },
      { suma: 88, ci: 151, percentil: ">99.9", ic95: "140-155" }, { suma: 89, ci: 152, percentil: ">99.9", ic95: "141-156" },
      { suma: 90, ci: 154, percentil: ">99.9", ic95: "143-157" }, { suma: 91, ci: 155, percentil: ">99.9", ic95: "144-158" },
      { suma: 92, ci: 156, percentil: ">99.9", ic95: "145-159" }, { suma: 93, ci: 158, percentil: ">99.9", ic95: "147-161" },
      { suma: 94, ci: 159, percentil: ">99.9", ic95: "148-162" }, { suma: 95, ci: 160, percentil: ">99.9", ic95: "149-163" }
    ]
  }
};
