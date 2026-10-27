export interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

export function getBankAccount(): BankAccount | null {
  const bank = process.env.BANK_NAME?.trim();
  const number = process.env.BANK_ACCOUNT_NUMBER?.trim();
  const holder = process.env.BANK_ACCOUNT_HOLDER?.trim();

  if (!bank || !number || !holder) return null;

  return { bank, number, holder };
}
