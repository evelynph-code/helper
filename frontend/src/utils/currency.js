
export const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$',
      RUB: '₽',  JPY: '¥', CNY: '¥', MYR: 'RM', SGD: '$',
      INR: '₹', NGN: '₦', BRL: 'R$', MXN: '$', VND: '₫'
    }
    return symbols[currency] || '$'
}