// import { jStat } from "jstat";

// /**
//  * Calculează statisticile descriptive și intervalul de încredere pentru medie.
//  * @param data Array de numere (eșantionul).
//  * @param alpha Nivelul de semnificație (implicit 0.05 pentru încredere 95%).
//  */
// export const calculateDescriptiveStats = (data, alpha: number = 0.05): DescriptiveStats => {
//     const n: number = data.length; // Volumul eșantionului n [cite: 12]
//     const df: number = n - 1;      // Grade de libertate (n-1) 
    
//     // Calculul mediei aritmetice: x_bar = (Sum x) / n [cite: 70]
//     const mean: number = jStat.mean(data);
    
//     // Calculul abaterii standard de eșantion (cu corecția n-1): s_x = sqrt(s^2_x) [cite: 78]
//     const stdDev: number = jStat.stdev(data, true);
    
//     // Calculul erorii standard a mediei: s_x_bar = s_x / sqrt(n) [cite: 111, 123]
//     const standardError: number = stdDev / Math.sqrt(n);
    
//     // Determinarea valorii critice t pentru test bilateral (two-tailed) [cite: 140, 141]
//     // jStat.studentt.inv calculează inversa distribuției Student t
//     const tCritical: number = jStat.studentt.inv(1 - alpha / 2, df);
    
//     // Calculul Confidence Level (produsul dintre t și eroarea standard) [cite: 143, 146]
//     const confidenceLevel: number = tCritical * standardError;

//     return {
//         n,
//         mean,
//         stdDev,
//         standardError,
//         confidenceLevel,
//         lowerBound: mean - confidenceLevel, // Limita inferioară a intervalului mu [cite: 141]
//         upperBound: mean + confidenceLevel  // Limita superioară a intervalului mu [cite: 141]
//     };
// };