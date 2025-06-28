
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD") {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Converts a number to words (Indian Numbering System)
export function numberToWords(num: number): string {
    const a = [
      '', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 
      'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    const inWords = (n: number, s: string): string => {
        let str = '';
        if (n > 19) {
            str += b[Math.floor(n / 10)] + a[n % 10];
        } else {
            str += a[n];
        }
        if (n !== 0) {
            str += s;
        }
        return str;
    };
    
    let result = '';
    result += inWords(Math.floor(num / 10000000), 'crore ');
    result += inWords(Math.floor((num / 100000) % 100), 'lakh ');
    result += inWords(Math.floor((num / 1000) % 100), 'thousand ');
    result += inWords(Math.floor((num / 100) % 10), 'hundred ');
    if (num > 100 && num % 100 > 0) {
        result += 'and ';
    }
    result += inWords(num % 100, '');

    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    const decimalNum = parseInt(decimalPart, 10);
    
    let finalResult = `Rupees ${result.trim()} only`;

    if (decimalNum > 0) {
        let decimalWords = '';
        decimalWords += inWords(decimalNum, '');
        finalResult = `Rupees ${result.trim()} and ${decimalWords.trim()} paise only`;
    }

    return finalResult.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
}
