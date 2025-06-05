export function calculateTotal(input: string): number {
    if (!input) return 0;
  
    return input
      .split(/[\n,]+/)               // split by newline OR comma
      .map(s => s.trim())            // remove extra spaces
      .filter(s => s !== "")         // remove empty strings
      .map(Number)                   // convert to numbers
      .filter(n => !isNaN(n))        // skip invalid numbers
      .reduce((acc, curr) => acc + curr, 0); // sum up
  }
  